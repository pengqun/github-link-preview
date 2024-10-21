from PIL import Image
import os
import sys


def resize_image(input_path, output_size, crop_mode='center'):
    with Image.open(input_path) as img:
        orig_width, orig_height = img.size

        ratio = max(output_size[0] / orig_width, output_size[1] / orig_height)
        new_size = (int(orig_width * ratio), int(orig_height * ratio))

        resized_img = img.resize(new_size, Image.LANCZOS)

        if crop_mode == 'topleft':
            crop_box = (0, 0, output_size[0], output_size[1])
        elif crop_mode == 'center':
            left = (new_size[0] - output_size[0]) // 2
            top = (new_size[1] - output_size[1]) // 2
            right = left + output_size[0]
            bottom = top + output_size[1]
            crop_box = (left, top, right, bottom)
        else:
            raise ValueError(
                "Invalid crop mode. Please use 'topleft' or 'center'")

        final_img = resized_img.crop(crop_box)

        filename, ext = os.path.splitext(input_path)
        output_filename = f"{filename}_{output_size[0]}x{output_size[1]}{ext}"

        final_img.save(output_filename)
        print(f"Saved resized image to: {output_filename}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(
            "Usage: python image-resizer.py <input image path> <width> <height> [crop mode]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_size = (int(sys.argv[2]), int(sys.argv[3]))
    crop_mode = sys.argv[4] if len(sys.argv) > 4 else 'center'

    try:
        resize_image(input_path, output_size, crop_mode)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
