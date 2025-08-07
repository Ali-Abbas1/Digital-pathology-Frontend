import os
import json
import argparse
from datetime import datetime

def find_heatmaps(base_dir=None, output_format='json'):
    """
    Search for heatmap files in the system and report on their locations
    """
    if base_dir is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Searching for heatmap files starting from: {base_dir}")
    
    # Where to look for heatmaps
    search_paths = [
        os.path.join(base_dir, 'slides', 'production_results'),
        os.path.join(base_dir, 'slides', 'raw_results'),
    ]
    
    # Extensions and patterns to look for
    heatmap_patterns = ['heatmap', 'blockmap', 'heat']
    extensions = ['.jpg', '.jpeg', '.png', '.tiff', '.tif']
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'base_dir': base_dir,
        'search_paths': search_paths,
        'heatmaps': []
    }
    
    # Walk through the directories
    for search_path in search_paths:
        if not os.path.exists(search_path):
            print(f"Directory does not exist: {search_path}")
            continue
            
        print(f"Searching in: {search_path}")
        
        for root, dirs, files in os.walk(search_path):
            for file in files:
                # Check if the file is a potential heatmap
                is_heatmap = False
                if any(ext in file.lower() for ext in extensions):
                    if any(pattern in file.lower() for pattern in heatmap_patterns):
                        is_heatmap = True
                
                if is_heatmap:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, base_dir)
                    
                    # Extract slide_id from the path
                    path_parts = relative_path.split(os.sep)
                    slide_id = None
                    if len(path_parts) >= 4:  # slides/production_results/[slide_id or subtask]/filename
                        slide_id = path_parts[-2]
                    
                    heatmap_info = {
                        'filename': file,
                        'path': file_path,
                        'relative_path': relative_path,
                        'size': os.path.getsize(file_path),
                        'modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
                        'slide_id': slide_id
                    }
                    
                    results['heatmaps'].append(heatmap_info)
                    
                    print(f"Found heatmap: {relative_path}")
    
    # Generate API URLs for each heatmap
    for heatmap in results['heatmaps']:
        if heatmap['slide_id']:
            # Try to construct a valid API URL
            path_parts = heatmap['relative_path'].split(os.sep)
            if 'HEATMAP_OUTPUT' in path_parts:
                # If in HEATMAP_OUTPUT directory
                heatmap['api_url'] = f"/api/results/HEATMAP_OUTPUT/{heatmap['slide_id']}/{heatmap['filename']}"
            else:
                # Standard path
                heatmap['api_url'] = f"/api/results/{heatmap['slide_id']}/{heatmap['filename']}"
    
    # Output format
    if output_format == 'json':
        # Save to a file
        output_file = os.path.join(base_dir, 'heatmap_inventory.json')
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Results saved to: {output_file}")
        
        return results
    else:
        # Print a summary
        print("\nHeatmap Inventory Summary:")
        print(f"Total heatmaps found: {len(results['heatmaps'])}")
        
        # Group by slide_id
        by_slide = {}
        for hm in results['heatmaps']:
            slide_id = hm['slide_id'] or 'unknown'
            if slide_id not in by_slide:
                by_slide[slide_id] = []
            by_slide[slide_id].append(hm)
        
        print(f"Heatmaps found for {len(by_slide)} slides:")
        for slide_id, heatmaps in by_slide.items():
            print(f"  {slide_id}: {len(heatmaps)} heatmap(s)")
            for hm in heatmaps:
                print(f"    - {hm['filename']} ({hm['relative_path']})")
                if 'api_url' in hm:
                    print(f"      API URL: {hm['api_url']}")
        
        return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Find heatmap files in the system')
    parser.add_argument('--dir', help='Base directory to search from')
    parser.add_argument('--format', choices=['json', 'text'], default='text', 
                        help='Output format (json or text)')
    
    args = parser.parse_args()
    find_heatmaps(base_dir=args.dir, output_format=args.format) 