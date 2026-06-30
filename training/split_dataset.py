import os
import shutil
from pathlib import Path

PATH = Path(__file__).parent.absolute()
SOURCE_DIR = PATH / 'C2FPW'
BEFORE_DIR = PATH / 'C2FPW_Before'
AFTER_DIR = PATH / 'C2FPW_After'

os.makedirs(BEFORE_DIR, exist_ok=True)
os.makedirs(AFTER_DIR, exist_ok=True)

def main():
    print("Bắt đầu quét và phân loại ảnh trong thư mục C2FPW...")
    
    # 1. Quét toàn bộ file ảnh .jpg đã tải về
    all_files = sorted(os.listdir(SOURCE_DIR))
    subjects_data = {}
    
    for filename in all_files:
        if not filename.endswith('.jpg'):
            continue
            
        parts = filename.replace('.jpg', '').split('_')
        if len(parts) < 3:
            continue
            
        subject_id = parts[0]
        try:
            birth_year = int(parts[1])
            photo_year = int(parts[2])
        except ValueError:
            continue
            
        # Lọc tuổi ảnh từ 18 tuổi trở lên (đã trưởng thành)
        age = photo_year - birth_year
        if age < 18:
            continue
            
        if subject_id not in subjects_data:
            subjects_data[subject_id] = []
            
        subjects_data[subject_id].append({
            "filename": filename,
            "year": photo_year,
            "age": age
        })
        
    print(f"Tìm thấy {len(subjects_data)} đối tượng người lớn.")
    
    # 2. Thực hiện phân tách thư mục
    before_count = 0
    after_count = 0
    
    for sid, photos in sorted(subjects_data.items()):
        # Sắp xếp ảnh theo năm tăng dần
        photos_sorted = sorted(photos, key=lambda x: x["year"])
        if len(photos_sorted) < 2:
            # Bỏ qua đối tượng nếu không có đủ 2 ảnh (cần ít nhất 1 ảnh trước và 1 ảnh sau)
            continue
            
        # Ảnh đầu tiên (earliest) đại diện cho ảnh đăng ký (Trước PTTM)
        before_photo = photos_sorted[0]
        shutil.copy2(
            SOURCE_DIR / before_photo["filename"], 
            BEFORE_DIR / before_photo["filename"]
        )
        before_count += 1
        
        # Tất cả các ảnh chụp ở các năm sau đó đại diện cho ảnh kiểm thử (Sau PTTM)
        for after_photo in photos_sorted[1:]:
            shutil.copy2(
                SOURCE_DIR / after_photo["filename"], 
                AFTER_DIR / after_photo["filename"]
            )
            after_count += 1
            
    print("\n=======================================================")
    print("HOÀN TẤT PHÂN TÁCH BỘ DỮ LIỆU C2FPW!")
    print(f"1. Thư mục đăng ký (Trước PTTM) - C2FPW_Before: {before_count} ảnh.")
    print(f"2. Thư mục kiểm thử (Sau PTTM) - C2FPW_After: {after_count} ảnh.")
    print("=======================================================")

if __name__ == "__main__":
    main()
