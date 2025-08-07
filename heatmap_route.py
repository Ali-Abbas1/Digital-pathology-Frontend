# Route to serve heatmap images
# Add this to your slide_routes.py file

@bp.route('/api/results/<slide_id>/<filename>', methods=['GET'])
def serve_result_file(slide_id, filename):
    """Serve specific result files including heatmap images"""
    try:
        # Construct the path to the result files
        # The slide_id is the task_id or original filename used for the production_results folder
        file_path = os.path.join(root_dir, 'slides', 'production_results', slide_id, filename)
        
        # Check if the file exists
        if not os.path.exists(file_path):
            # If specific file not found, look for alternatives
            if filename.endswith('_heatmap.jpg'):
                # Try alternative heatmap filenames
                alternatives = [
                    f"{slide_id}_heatmap.jpg",
                    "heatmap.jpg",
                    "prediction_heatmap.jpg",
                    "merged_heatmap.jpg"
                ]
                
                for alt_name in alternatives:
                    alt_path = os.path.join(root_dir, 'slides', 'production_results', slide_id, alt_name)
                    if os.path.exists(alt_path):
                        file_path = alt_path
                        break
                else:
                    # No alternatives found
                    return jsonify({
                        'status': 'error',
                        'message': 'Heatmap file not found'
                    }), 404
            else:
                # Not a heatmap request or no alternative found
                return jsonify({
                    'status': 'error',
                    'message': 'File not found'
                }), 404
        
        # Determine content type based on file extension
        content_type = None
        if filename.endswith('.jpg') or filename.endswith('.jpeg'):
            content_type = 'image/jpeg'
        elif filename.endswith('.png'):
            content_type = 'image/png'
        elif filename.endswith('.json'):
            content_type = 'application/json'
        
        # Set cache headers for images to improve performance
        response = send_file(file_path, mimetype=content_type)
        if content_type and content_type.startswith('image/'):
            response.headers['Cache-Control'] = 'public, max-age=86400'  # Cache for 24 hours
        
        return response

    except Exception as e:
        logger.error(f"Error serving result file: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error serving file: {str(e)}'
        }), 500

# Add a route to list available heatmap files for a slide
@bp.route('/api/results/<slide_id>/heatmaps', methods=['GET'])
def list_slide_heatmaps(slide_id):
    """List all available heatmap images for a specific slide"""
    try:
        result_dir = os.path.join(root_dir, 'slides', 'production_results', slide_id)
        
        if not os.path.exists(result_dir):
            return jsonify({
                'status': 'error',
                'message': 'Slide results not found'
            }), 404
        
        # List all image files in the directory
        heatmap_files = []
        for file in os.listdir(result_dir):
            if file.endswith(('.jpg', '.jpeg', '.png')) and 'heatmap' in file.lower():
                file_path = os.path.join(result_dir, file)
                heatmap_files.append({
                    'filename': file,
                    'size': os.path.getsize(file_path),
                    'url': f"/api/results/{slide_id}/{file}"
                })
        
        return jsonify({
            'status': 'success',
            'slide_id': slide_id,
            'heatmaps': heatmap_files
        })
    
    except Exception as e:
        logger.error(f"Error listing heatmaps: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error listing heatmaps: {str(e)}'
        }), 500 