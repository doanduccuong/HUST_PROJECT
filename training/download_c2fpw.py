import os
import csv
import urllib.request
import urllib.error
import concurrent.futures
from pathlib import Path

PATH = Path(__file__).parent.absolute()
CSV_PATH = PATH / 'C2FPW.csv'
DOWNLOAD_DIR = PATH / 'C2FPW'

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_single_image(row):
    image_name = row['Image']
    url = row['Link']
    filename = DOWNLOAD_DIR / f"{image_name}.jpg"
    
    # Bỏ qua nếu ảnh đã được tải về trước đó
    if filename.exists():
        return None
        
    # Chỉ tải các đường dẫn ảnh hợp lệ
    if not any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        return f"Skipped (invalid extension): {image_name} - {url}"
        
    try:
        opener = urllib.request.build_opener()
        opener.addheaders = [
            ('User-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36')
        ]
        urllib.request.install_opener(opener)
        
        # Tải ảnh với timeout 5 giây để tránh bị treo
        with urllib.request.urlopen(url, timeout=5) as response:
            content = response.read()
            # Bỏ qua nếu là trang HTML (lỗi chặn đường link)
            if content.startswith(b"<!DO") or content.startswith(b"<htm") or b"html" in content[:100].lower():
                return f"HTML Error: {image_name} - {url}"
            with open(filename, "wb") as f:
                f.write(content)
        return f"Success: {image_name}"
    except Exception as e:
        return f"Failed: {image_name} - {url} - Error: {str(e)}"

def main():
    print("Đang đọc danh sách liên kết từ C2FPW.csv...")
    rows = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
            
    total_images = len(rows)
    print(f"Tổng số ảnh cần tải: {total_images}. Bắt đầu tải song song (Multi-threading)...")
    
    # Sử dụng ThreadPoolExecutor với tối đa 30 luồng tải song song để tối ưu tốc độ
    success_count = 0
    failed_count = 0
    skipped_count = 0
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
        # Submit tất cả các luồng tải
        future_to_row = {executor.submit(download_single_image, row): row for row in rows}
        
        for future in concurrent.futures.as_completed(future_to_row):
            result = future.result()
            if result:
                if result.startswith("Success"):
                    success_count += 1
                elif result.startswith("Skipped") or result.startswith("HTML"):
                    skipped_count += 1
                else:
                    failed_count += 1
                    
            # In tiến độ định kỳ mỗi 50 ảnh
            total_processed = success_count + failed_count + skipped_count
            if total_processed % 100 == 0 or total_processed == total_images:
                print(f"Tiến độ: {total_processed}/{total_images} ({ (total_processed/total_images)*100:.1f}%) | Thành công: {success_count} | Lỗi/Bỏ qua: {failed_count + skipped_count}")
                
    print("\n=======================================================")
    print("HOÀN TẤT QUÁ TRÌNH TẢI DỮ LIỆU C2FPW!")
    print(f"Thư mục lưu trữ: {DOWNLOAD_DIR}")
    print(f"Đã tải thành công: {success_count} ảnh.")
    print(f"Bị lỗi hoặc bỏ qua: {failed_count + skipped_count} ảnh.")
    print("=======================================================")

if __name__ == "__main__":
    main()
