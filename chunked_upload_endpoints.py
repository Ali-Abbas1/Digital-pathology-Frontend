@bp.route('/initialize-chunked-upload', methods=['POST'])
def initialize_chunked_upload():
    try:
        data = request.json
        upload_id = data.get('uploadId')
        file_name = data.get('fileName')
        is_compressed = data.get('compressed', False)
        original_name = data.get('originalName')
        
        if not upload_id or not file_name:
            return jsonify({
                'status': 'error',
                'message': 'Missing uploadId or fileName'
            }), 400

        # Create upload directory for chunks
        upload_dir = os.path.join(root_dir, 'uploads', 'temp', upload_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Store metadata about the upload
        metadata = {
            'upload_id': upload_id,
            'file_name': file_name,
            'is_compressed': is_compressed,
            'original_name': original_name,
            'created_at': datetime.now().isoformat()
        }
        
        with open(os.path.join(upload_dir, 'metadata.json'), 'w') as f:
            json.dump(metadata, f)

        return jsonify({
            'status': 'success',
            'message': 'Chunked upload initialized',
            'upload_id': upload_id
        }), 200

    except Exception as e:
        logger.error(f"Error initializing chunked upload: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error initializing chunked upload: {str(e)}'
        }), 500

@bp.route('/upload-chunk', methods=['POST'])
def upload_chunk():
    try:
        if 'chunk' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No chunk in request'
            }), 400

        chunk = request.files['chunk']
        chunk_index = request.form.get('chunkIndex')
        upload_id = request.form.get('uploadId')
        total_chunks = request.form.get('totalChunks')

        if not all([chunk, chunk_index, upload_id]):
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters'
            }), 400

        # Save chunk to temporary directory
        chunk_dir = os.path.join(root_dir, 'uploads', 'temp', upload_id)
        if not os.path.exists(chunk_dir):
            os.makedirs(chunk_dir, exist_ok=True)
            
        chunk_path = os.path.join(chunk_dir, f'chunk_{chunk_index}')
        chunk.save(chunk_path)

        # Return information about progress
        return jsonify({
            'status': 'success',
            'message': f'Chunk {chunk_index} received',
            'chunkIndex': chunk_index,
            'totalChunks': total_chunks,
            'uploadId': upload_id
        }), 200

    except Exception as e:
        logger.error(f"Error uploading chunk: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error uploading chunk: {str(e)}'
        }), 500

@bp.route('/complete-chunked-upload', methods=['POST'])
def complete_chunked_upload():
    try:
        data = request.json
        upload_id = data.get('uploadId')
        file_name = data.get('fileName')
        total_chunks = data.get('totalChunks')

        if not all([upload_id, file_name, total_chunks]):
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters'
            }), 400

        # Get metadata about the upload
        chunk_dir = os.path.join(root_dir, 'uploads', 'temp', upload_id)
        metadata_path = os.path.join(chunk_dir, 'metadata.json')
        
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {
                'is_compressed': False,
                'original_name': file_name
            }

        is_compressed = metadata.get('is_compressed', False)
        original_name = metadata.get('original_name', file_name)
        
        # Create final filename
        final_filename = original_name if original_name and is_compressed else file_name
        secure_name = secure_filename(final_filename)
        
        # Temporary combined file path
        temp_combined_path = os.path.join(chunk_dir, 'combined_file')
        
        # Combine chunks into temporary file
        with open(temp_combined_path, 'wb') as combined_file:
            for i in range(int(total_chunks)):
                chunk_path = os.path.join(chunk_dir, f'chunk_{i}')
                if not os.path.exists(chunk_path):
                    return jsonify({
                        'status': 'error',
                        'message': f'Missing chunk {i}'
                    }), 400
                with open(chunk_path, 'rb') as chunk_file:
                    combined_file.write(chunk_file.read())
        
        # Create uploads directory if not exists
        upload_dir = os.path.join(root_dir, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Final path for the file
        final_path = os.path.join(upload_dir, secure_name)
        
        # Handle decompression if needed
        if is_compressed:
            logger.info(f"Decompressing chunked upload: {upload_id}")
            try:
                import gzip
                with gzip.open(temp_combined_path, 'rb') as f_in:
                    with open(final_path, 'wb') as f_out:
                        f_out.write(f_in.read())
                logger.info(f"Successfully decompressed chunked file to: {final_path}")
            except Exception as e:
                logger.error(f"Error decompressing chunked file: {str(e)}")
                return jsonify({
                    'status': 'error',
                    'message': f'Error decompressing chunked file: {str(e)}'
                }), 500
        else:
            # Just move the combined file to the final location
            import shutil
            shutil.copy(temp_combined_path, final_path)
        
        # Start processing the file
        task = process_slide_task.delay(final_path)
        
        # Clean up temporary files
        import shutil
        shutil.rmtree(chunk_dir)

        return jsonify({
            'status': 'success',
            'message': 'Chunked upload completed successfully',
            'data': {
                'task_id': task.id,
                'filename': final_filename,
                'upload_path': final_path
            }
        }), 200

    except Exception as e:
        logger.error(f"Error completing chunked upload: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error completing chunked upload: {str(e)}'
        }), 500 