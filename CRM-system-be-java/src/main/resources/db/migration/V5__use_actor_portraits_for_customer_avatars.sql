-- Replace placeholder avatars with stable Wikimedia Commons actor portraits.
-- The customer names and their commerce/camera histories remain unchanged.

UPDATE customers
SET user_image = CASE name
    WHEN 'Nguyễn Minh Anh'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Scarlett_Johansson_3.jpg?width=600'
    WHEN 'Trần Quốc Bảo'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tom_Cruise-2428_(cropped).jpg?width=600'
    WHEN 'Lê Thu Hà'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Anne_Hathaway-68408.jpg?width=600'
    WHEN 'Phạm Gia Huy'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Leonardo_DiCaprio_June_2014.jpg?width=600'
    WHEN 'Hoàng Ngọc Lan'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/NataliePortman.jpg?width=600'
    WHEN 'Vũ Đức Long'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Brad_Pitt_2008.jpg?width=600'
    WHEN 'Đỗ Khánh Linh'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gal_Gadot_(36165097896)_(cropped).jpg?width=600'
    WHEN 'Bùi Tuấn Kiệt'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Robert_Downey_Jr._2011_AA.jpg?width=600'
    WHEN 'Đặng Mai Phương'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Margot_Robbie_2016_cropped_and_retouched.jpg?width=600'
    WHEN 'Hồ Nhật Nam'
        THEN 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chris_Hemsworth_at_the_2024_Cannes_Film_Festival.jpg?width=600'
    ELSE user_image
END
WHERE name IN (
    'Nguyễn Minh Anh',
    'Trần Quốc Bảo',
    'Lê Thu Hà',
    'Phạm Gia Huy',
    'Hoàng Ngọc Lan',
    'Vũ Đức Long',
    'Đỗ Khánh Linh',
    'Bùi Tuấn Kiệt',
    'Đặng Mai Phương',
    'Hồ Nhật Nam'
);
