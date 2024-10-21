import os
from image_resizer import resize_image

# Define the list of file paths and their expected resize dimensions
IMAGE_LIST = [
    ("assets/content.jpg", (1280, 800), "topleft"),
    ("assets/options.jpg", (1280, 800), "center"),
    ("assets/popup.jpg", (640, 400), "center"),
]


def batch_resize():
    for input_path, output_size, crop_mode in IMAGE_LIST:
        if not os.path.exists(input_path):
            print(f"Warning: File not found - {input_path}")
            continue

        try:
            resize_image(input_path, output_size, crop_mode)
            print(f"Successfully resized {input_path} to {
                  output_size[0]}x{output_size[1]}")
        except Exception as e:
            print(f"Error resizing {input_path}: {str(e)}")


if __name__ == "__main__":
    batch_resize()
