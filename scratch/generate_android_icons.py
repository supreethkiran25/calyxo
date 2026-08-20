import os
from PIL import Image, ImageDraw, ImageFilter

project_root = "/Users/supreethk/Documents/calyxo/CALYXOAPP"
source_path = os.path.join(project_root, "public", "calyxo-removebg-preview.png")
if not os.path.exists(source_path):
    source_path = os.path.join(project_root, "public", "icon-512x512.png")

print(f"Using source logo: {source_path}")
logo_img = Image.open(source_path).convert("RGBA")

# Ensure logo is trimmed and centered
bbox = logo_img.getbbox()
if bbox:
    logo_img = logo_img.crop(bbox)

densities = {
    "mipmap-mdpi": {"launcher": 48, "foreground": 108},
    "mipmap-hdpi": {"launcher": 72, "foreground": 162},
    "mipmap-xhdpi": {"launcher": 96, "foreground": 216},
    "mipmap-xxhdpi": {"launcher": 144, "foreground": 324},
    "mipmap-xxxhdpi": {"launcher": 192, "foreground": 432}
}

res_root = os.path.join(project_root, "android", "app", "src", "main", "res")

for folder, sizes in densities.items():
    folder_path = os.path.join(res_root, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    l_size = sizes["launcher"]
    fg_size = sizes["foreground"]
    
    # 1. Generate Foreground (Transparent with centered logo inside 66% safe area)
    fg_img = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    target_logo_size = int(fg_size * 0.58)
    
    # Resize logo preserving aspect ratio
    w, h = logo_img.size
    aspect = w / h
    if aspect > 1:
        new_w = target_logo_size
        new_h = int(target_logo_size / aspect)
    else:
        new_h = target_logo_size
        new_w = int(target_logo_size * aspect)
    
    resized_logo = logo_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    offset_x = (fg_size - new_w) // 2
    offset_y = (fg_size - new_h) // 2
    fg_img.paste(resized_logo, (offset_x, offset_y), resized_logo)
    
    fg_out_path = os.path.join(folder_path, "ic_launcher_foreground.png")
    fg_img.save(fg_out_path, "PNG")
    print(f"Generated: {fg_out_path} ({fg_size}x{fg_size})")
    
    # 2. Generate Full Launcher Icon (Obsidian dark background + centered logo)
    launcher_img = Image.new("RGBA", (l_size, l_size), (10, 10, 12, 255))
    target_l_logo_size = int(l_size * 0.72)
    if aspect > 1:
        l_new_w = target_l_logo_size
        l_new_h = int(target_l_logo_size / aspect)
    else:
        l_new_h = target_l_logo_size
        l_new_w = int(target_l_logo_size * aspect)
    
    l_resized = logo_img.resize((l_new_w, l_new_h), Image.Resampling.LANCZOS)
    l_offset_x = (l_size - l_new_w) // 2
    l_offset_y = (l_size - l_new_h) // 2
    launcher_img.paste(l_resized, (l_offset_x, l_offset_y), l_resized)
    
    launcher_out_path = os.path.join(folder_path, "ic_launcher.png")
    launcher_img.save(launcher_out_path, "PNG")
    print(f"Generated: {launcher_out_path} ({l_size}x{l_size})")
    
    # 3. Generate Round Launcher Icon
    round_img = Image.new("RGBA", (l_size, l_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(round_img)
    draw.ellipse((0, 0, l_size - 1, l_size - 1), fill=(10, 10, 12, 255))
    
    r_target_logo = int(l_size * 0.65)
    if aspect > 1:
        r_new_w = r_target_logo
        r_new_h = int(r_target_logo / aspect)
    else:
        r_new_h = r_target_logo
        r_new_w = int(r_target_logo * aspect)
        
    r_resized = logo_img.resize((r_new_w, r_new_h), Image.Resampling.LANCZOS)
    r_offset_x = (l_size - r_new_w) // 2
    r_offset_y = (l_size - r_new_h) // 2
    round_img.paste(r_resized, (r_offset_x, r_offset_y), r_resized)
    
    round_out_path = os.path.join(folder_path, "ic_launcher_round.png")
    round_img.save(round_out_path, "PNG")
    print(f"Generated: {round_out_path} ({l_size}x{l_size})")

print("All Android launcher icons generated successfully!")
