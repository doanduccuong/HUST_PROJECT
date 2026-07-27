# Ý nghĩa các số liệu trên Dashboard trải nghiệm khách hàng

> Ngày dữ liệu đang xem: **23/07/2026**  
> Mục đích: giải thích các con số dưới góc nhìn nghiệp vụ và vận hành cửa hàng.

## 1. Bức tranh tổng thể

Trong ngày 23/07/2026, hệ thống ghi nhận:

- **2 khách hàng** đi qua cửa hàng.
- Mỗi khách được quan sát tại **6 điểm chạm**.
- Tổng cộng có **12 lần ghi nhận cảm xúc**.

Sáu điểm chạm gồm:

1. Cổng vào.
2. Khu vực chờ.
3. Khu vực tư vấn.
4. Khu vực sản phẩm.
5. Quầy thanh toán.
6. Cổng ra.

Vì vậy:

```text
2 khách × 6 điểm chạm = 12 mẫu cảm xúc
```

Đây là điểm quan trọng nhất khi đọc Dashboard:

- Số **2** là số khách khác nhau.
- Số **12** là số lần quan sát cảm xúc.
- Các tỷ lệ CBI, IBI, DRI và phân bố cảm xúc đang được tính trên **12 lần quan sát**, không phải trên 2 khách.

## 2. Tóm tắt dữ liệu cảm xúc

| Cảm xúc | Số lần ghi nhận | Tỷ lệ | Ý nghĩa |
|---|---:|---:|---|
| Rất hài lòng — Delighted | 3 | 25% | Khách thể hiện sự hài lòng rõ rệt |
| Hứng thú — Engaged | 3 | 25% | Khách chú ý và có tương tác tích cực |
| Trung tính — Neutral | 3 | 25% | Chưa có biểu hiện tích cực hoặc tiêu cực rõ ràng |
| Phân vân — Confused | 2 | 17% | Khách chưa hiểu, khó lựa chọn hoặc cần hỗ trợ |
| Sốt ruột — Impatient | 1 | 8% | Khách có dấu hiệu chờ lâu hoặc mất kiên nhẫn |
| Không hài lòng — Dissatisfied | 0 | 0% | Không ghi nhận phản ứng tiêu cực mạnh |
| **Tổng cộng** | **12** | **100%** | 12 lần quan sát tại các điểm chạm |

Có thể gom thành ba nhóm:

| Nhóm | Thành phần | Số mẫu | Tỷ lệ |
|---|---|---:|---:|
| Tích cực | Delighted + Engaged | 6 | 50% |
| Trung tính | Neutral | 3 | 25% |
| Có vấn đề | Confused + Impatient + Dissatisfied | 3 | 25% |

Ý nghĩa tổng quan:

- Một nửa số lần quan sát cho thấy khách đang có trải nghiệm tích cực.
- Một phần tư là trung tính.
- Một phần tư cho thấy có ma sát trong trải nghiệm.
- Vấn đề chính là **phân vân**, không phải bất mãn nghiêm trọng.

## 3. Tổng lượng khách — 2

### Con số này thể hiện điều gì?

Đây là số khách hàng khác nhau được hệ thống nhận diện có xuất hiện trong ngày đang xem.

Nó không phải:

- 12 lượt camera ghi nhận.
- 12 người khác nhau.
- Tổng số lần khách đi qua từng khu vực.

Hai khách đi qua nhiều điểm chạm nhưng mỗi người chỉ được tính một lần trong chỉ số tổng lượng khách.

### Vì sao ra số 2?

Hệ thống đang có hai hành trình khách hàng trong ngày:

- Khách thứ nhất đi qua 6 điểm chạm.
- Khách thứ hai đi qua 6 điểm chạm.

Do đó:

```text
Số khách khác nhau = 2
Tổng mẫu cảm xúc = 2 × 6 = 12
```

### Nên hiểu con số này như thế nào?

Mẫu chỉ có 2 khách là quá nhỏ để kết luận xu hướng vận hành của cả cửa hàng. Các tỷ lệ trên Dashboard có thể thay đổi rất mạnh chỉ với một lần ghi nhận cảm xúc khác.

Ví dụ:

- Hiện có 1 mẫu Impatient trên 12 mẫu nên IBI là 8.3%.
- Nếu thêm 1 mẫu Impatient, tỷ lệ sẽ thành 2/13 = 15.4%.

## 4. Chỉ số phân vân CBI — 16.7%

### CBI thể hiện điều gì?

CBI đo tỷ lệ những lần khách có biểu hiện:

- Chưa hiểu thông tin.
- Khó lựa chọn sản phẩm.
- Không rõ quy trình.
- Cần nhân viên giải thích thêm.
- Bị rối trước quá nhiều phương án.

CBI càng cao thì khả năng khách đang gặp trở ngại trong quá trình tìm hiểu và ra quyết định càng lớn.

### Vì sao ra 16.7%?

Trong 12 lần quan sát có 2 lần khách thể hiện trạng thái phân vân:

```text
2 lần phân vân / 12 lần quan sát × 100 = 16.7%
```

Hai lần phân vân xuất hiện tại:

- Một lần ở **khu vực chờ**.
- Một lần ở **khu vực tư vấn**.

### Con số này tốt hay xấu?

Mục tiêu hiển thị trên Dashboard là:

```text
CBI <= 8%
```

Kết quả thực tế:

```text
16.7% > 8%
```

CBI đang:

- Cao hơn mục tiêu **8.7 điểm phần trăm**.
- Xấp xỉ **2.1 lần** mức mục tiêu.

Về ý nghĩa nghiệp vụ, đây nên được xem là một tín hiệu cảnh báo. Badge **Tốt** đang hiển thị trên Dashboard không phù hợp với chính mục tiêu `<= 8%`.

### Hành động nên cân nhắc

- Kiểm tra biển hướng dẫn tại khu vực chờ.
- Làm rõ quy trình xếp hàng và thời gian chờ dự kiến.
- Giảm số phương án tư vấn gây quá tải thông tin.
- Chủ động bố trí nhân viên tiếp cận khách đang lúng túng.
- Kiểm tra cách nhân viên giải thích sản phẩm tại khu vực tư vấn.

## 5. Chỉ số sốt ruột IBI — 8.3%

### IBI thể hiện điều gì?

IBI đo tỷ lệ những lần khách có dấu hiệu:

- Chờ quá lâu.
- Mất kiên nhẫn.
- Muốn được phục vụ nhanh hơn.
- Có nguy cơ bỏ hàng hoặc rời cửa hàng.

IBI cao thường phản ánh vấn đề về thời gian chờ, tốc độ phục vụ hoặc phân bổ nhân sự.

### Vì sao ra 8.3%?

Trong 12 lần quan sát có 1 lần khách thể hiện trạng thái sốt ruột:

```text
1 lần sốt ruột / 12 lần quan sát × 100 = 8.3%
```

Lần sốt ruột này xuất hiện tại **khu vực chờ**.

### Con số này tốt hay xấu?

Mục tiêu hiển thị:

```text
IBI <= 5%
```

Kết quả:

```text
8.3% > 5%
```

IBI đang:

- Cao hơn mục tiêu **3.3 điểm phần trăm**.
- Xấp xỉ **1.7 lần** mức mục tiêu.

Badge **Cảnh báo** phù hợp với ý nghĩa của dữ liệu hiện tại.

### Hành động nên cân nhắc

- Đo thời gian chờ thực tế tại khu vực chờ.
- Bổ sung nhân sự vào thời điểm đông khách.
- Thông báo thời gian chờ dự kiến cho khách.
- Tạo luồng phục vụ nhanh cho yêu cầu đơn giản.
- Chủ động điều phối khách sang quầy ít tải hơn.

## 6. Chỉ số không hài lòng DRI — 0.0%

### DRI thể hiện điều gì?

DRI đo tỷ lệ những lần khách có biểu hiện tiêu cực mạnh, chẳng hạn:

- Không hài lòng rõ ràng.
- Khó chịu với dịch vụ.
- Phản ứng tiêu cực sau tư vấn hoặc thanh toán.
- Có nguy cơ khiếu nại hoặc đánh giá xấu.

### Vì sao ra 0.0%?

Không có lần quan sát nào được xếp vào trạng thái không hài lòng:

```text
0 lần không hài lòng / 12 lần quan sát × 100 = 0.0%
```

### Con số này tốt hay xấu?

Mục tiêu là:

```text
DRI <= 6%
```

Kết quả 0% là tích cực và badge **Rất tốt** phù hợp với dữ liệu.

Tuy nhiên, không nên hiểu 0% là chắc chắn toàn bộ khách đều hài lòng:

- Mẫu chỉ có 2 khách.
- Hệ thống chỉ suy luận từ biểu cảm camera.
- Khách trung tính hoặc phân vân vẫn có thể chưa hài lòng nhưng chưa thể hiện rõ.
- Cần kết hợp thêm khảo sát, phản hồi và khiếu nại thực tế.

## 7. Tỷ lệ EDC — 50.0%

### EDC đang thể hiện điều gì?

Dashboard mô tả EDC là:

```text
Engaged -> Delighted
```

Về mặt kỳ vọng nghiệp vụ, chỉ số này nên cho biết tỷ lệ khách chuyển từ:

- Đang quan tâm, hứng thú.
- Sang trạng thái rất hài lòng.

### Vì sao hiện tại ra 50%?

Dữ liệu có:

```text
3 lần Engaged
3 lần Delighted
```

Dashboard hiện tính:

```text
3 Delighted / (3 Delighted + 3 Engaged) × 100 = 50%
```

### Cần hiểu con số 50% như thế nào?

Con số hiện tại chỉ có nghĩa:

> Trong tổng số lần ghi nhận thuộc hai nhóm Engaged và Delighted, một nửa là Delighted.

Nó chưa chứng minh rằng:

- 50% khách Engaged đã chuyển thành Delighted.
- 50% khách đã mua hàng.
- 50% khách đã chuyển đổi thành công.

Muốn gọi đây là tỷ lệ chuyển đổi thật, hệ thống phải theo dõi cùng một khách theo thứ tự thời gian và xác định rõ khách đó từng Engaged rồi sau đó chuyển sang Delighted.

### Ý nghĩa vận hành có thể rút ra

Trong dữ liệu hiện tại, hai khách đều đạt trạng thái Delighted tại quầy thanh toán. Đây là tín hiệu cho thấy trải nghiệm có xu hướng được cải thiện ở giai đoạn cuối hành trình.

Tuy nhiên, với chỉ 2 khách, chưa đủ cơ sở để kết luận quy trình thanh toán luôn tạo ra sự hài lòng.

## 8. Phân bố cảm xúc — Tổng mẫu 12

### “Tổng mẫu 12” nghĩa là gì?

Đây là 12 lần hệ thống quan sát và phân loại cảm xúc:

```text
2 khách × 6 điểm chạm = 12 mẫu
```

Nó không phải 12 khách.

### Delighted — 25%, 3 lượt

Có 3 lần khách thể hiện sự hài lòng rõ ràng:

```text
3 / 12 × 100 = 25%
```

Ba lần này xuất hiện:

- Hai lần tại quầy thanh toán.
- Một lần tại cổng ra.

Ý nghĩa: giai đoạn thanh toán và kết thúc hành trình đang tạo tín hiệu tích cực.

### Engaged — 25%, 3 lượt

Có 3 lần khách thể hiện sự quan tâm hoặc tương tác tích cực:

```text
3 / 12 × 100 = 25%
```

Ba lần này xuất hiện:

- Một lần tại khu vực tư vấn.
- Hai lần tại khu vực sản phẩm.

Ý nghĩa: khi tiếp cận sản phẩm, cả hai khách đều có biểu hiện hứng thú.

### Neutral — 25%, 3 lượt

Có 3 lần khách ở trạng thái trung tính:

```text
3 / 12 × 100 = 25%
```

Ba lần này xuất hiện:

- Hai lần tại cổng vào.
- Một lần tại cổng ra.

Ý nghĩa:

- Cả hai khách bắt đầu hành trình với trạng thái trung tính.
- Một khách rời đi trong trạng thái trung tính, chưa thể hiện hài lòng rõ ràng.

### Confused — 17%, 2 lượt

Có 2 lần khách phân vân:

```text
2 / 12 × 100 = 16.7%
```

Danh sách phân bố làm tròn thành `17%`.

Hai lần này xuất hiện:

- Khu vực chờ.
- Khu vực tư vấn.

Đây là dấu hiệu cho thấy khách có thể chưa rõ quy trình hoặc chưa nhận được thông tin tư vấn đủ dễ hiểu.

### Impatient — 8%, 1 lượt

Có 1 lần khách sốt ruột:

```text
1 / 12 × 100 = 8.3%
```

Danh sách phân bố làm tròn thành `8%`.

Trạng thái này xuất hiện tại khu vực chờ, củng cố nhận định rằng khu vực chờ là điểm cần ưu tiên cải thiện.

### Dissatisfied — 0%, 0 lượt

Không có phản ứng không hài lòng mạnh.

Đây là kết quả tích cực, nhưng vẫn cần lưu ý:

- Có 2 lượt phân vân.
- Có 1 lượt sốt ruột.

Nếu không xử lý, những trạng thái nhẹ này có thể phát triển thành không hài lòng ở các hành trình khác.

## 9. Diễn biến hai hành trình khách hàng

### Khách thứ nhất

```text
Cổng vào
Neutral
    ↓
Khu vực chờ
Confused
    ↓
Khu vực tư vấn
Engaged
    ↓
Khu vực sản phẩm
Engaged
    ↓
Quầy thanh toán
Delighted
    ↓
Cổng ra
Delighted
```

Diễn giải:

- Khách bắt đầu trung tính.
- Bị phân vân tại khu vực chờ.
- Sau khi được tư vấn, khách chuyển sang hứng thú.
- Tại quầy thanh toán và cổng ra, khách thể hiện hài lòng rõ ràng.

Đây là một hành trình có kết thúc tích cực.

### Khách thứ hai

```text
Cổng vào
Neutral
    ↓
Khu vực chờ
Impatient
    ↓
Khu vực tư vấn
Confused
    ↓
Khu vực sản phẩm
Engaged
    ↓
Quầy thanh toán
Delighted
    ↓
Cổng ra
Neutral
```

Diễn giải:

- Khách bắt đầu trung tính.
- Có dấu hiệu sốt ruột khi chờ.
- Vẫn còn phân vân tại khu vực tư vấn.
- Trở nên hứng thú khi tiếp cận sản phẩm.
- Hài lòng tại quầy thanh toán.
- Khi rời cửa hàng trở về trạng thái trung tính.

Hành trình này cho thấy dịch vụ đã cải thiện cảm xúc của khách, nhưng khu vực chờ và tư vấn vẫn gây ma sát.

## 10. Hiệu suất theo ca làm việc

### Ý nghĩa các cột

| Cột | Ý nghĩa |
|---|---|
| Khách ghé | Số khách khác nhau xuất hiện trong ca |
| Công suất | Mức sử dụng so với sức chứa giả định 5 khách |
| Delight | Tỷ lệ mẫu Delighted trong ca |
| Impatient | Tỷ lệ mẫu Impatient trong ca |
| Trạng thái | Đánh giá ca không hoạt động, ổn định hoặc quá tải |

### Ca sáng đang hiển thị

| Chỉ số | Giá trị | Vì sao |
|---|---:|---|
| Khách ghé | 2 khách | Hai khách được xếp vào khung giờ ca sáng |
| Công suất | 40% | `2 khách / sức chứa 5 khách = 40%` |
| Delight | 25.0% | 3 mẫu Delighted trên tổng 12 mẫu trong ca |
| Impatient | 8.3% | 1 mẫu Impatient trên tổng 12 mẫu trong ca |
| Trạng thái | Ổn định | Có khách và công suất chưa vượt 100% |

### Ca tối đang hiển thị

| Chỉ số | Giá trị | Ý nghĩa |
|---|---:|---|
| Khách ghé | 0 khách | Không có dữ liệu được hệ thống xếp vào ca tối |
| Công suất | 0% | Không có khách |
| Delight | 0.0% | Không có mẫu cảm xúc |
| Impatient | 0.0% | Không có mẫu cảm xúc |
| Trạng thái | Không hoạt động | Không có khách |

### Công suất 40% có ý nghĩa gì?

Dashboard đang giả định sức chứa chuẩn là 5 khách:

```text
2 khách / 5 khách × 100 = 40%
```

Con số này chỉ có giá trị nếu 5 khách thực sự là sức chứa hoặc năng lực phục vụ chuẩn của ca.

Hiện chưa có thông tin về:

- Số nhân viên trong ca.
- Số quầy đang mở.
- Năng lực xử lý của từng quầy.
- Diện tích hoặc sức chứa thật của cửa hàng.

Do đó 40% nên được hiểu là mức tải theo một giả định, chưa phải công suất vận hành được hiệu chỉnh thực tế.

## 11. Vấn đề phân ca theo múi giờ

Các sự kiện đang được lưu ở khoảng:

```text
09:55–10:05 UTC
```

Quy đổi sang giờ Việt Nam GMT+7:

```text
16:55–17:05 GMT+7
```

Theo giờ Việt Nam, đây phải là **ca tối 15:00–22:00**, không phải ca sáng.

Dashboard hiện đang xếp các sự kiện vào ca sáng. Vì vậy, nếu báo cáo phục vụ cửa hàng tại Việt Nam, bảng đúng về mặt nghiệp vụ nên gần như sau:

| Ca | Khách | Công suất | Delight | Impatient | Trạng thái |
|---|---:|---:|---:|---:|---|
| Ca sáng | 0 | 0% | 0% | 0% | Không hoạt động |
| Ca tối | 2 | 40% | 25.0% | 8.3% | Ổn định |

Đây là lỗi cần sửa trước khi dùng số liệu theo ca để điều phối nhân sự.

## 12. Khuyến nghị ca tối trên Dashboard

Dashboard đang hiển thị nội dung:

> Ca tối đang gặp tình trạng quá tải nghiêm trọng...

Nhưng ngay trên bảng:

```text
Ca tối = 0 khách
Công suất = 0%
Trạng thái = Không hoạt động
```

Hai thông tin này mâu thuẫn nhau.

Vì vậy, không nên sử dụng câu khuyến nghị này để ra quyết định vận hành ở trạng thái hiện tại. Khuyến nghị chỉ nên xuất hiện khi có dữ liệu chứng minh:

- Công suất vượt ngưỡng.
- IBI vượt ngưỡng.
- Có đủ số mẫu tối thiểu.
- Tình trạng kéo dài trong một khoảng thời gian đủ lớn.

## 13. Các badge đang thể hiện đúng hay sai?

| Chỉ số | Kết quả | Mục tiêu | Badge hiện tại | Đánh giá |
|---|---:|---:|---|---|
| Tổng khách | 2 | Chưa có chuẩn | Bình thường | Chưa đủ cơ sở |
| CBI | 16.7% | <= 8% | Tốt | **Không phù hợp** |
| IBI | 8.3% | <= 5% | Cảnh báo | Phù hợp |
| DRI | 0.0% | <= 6% | Rất tốt | Phù hợp |
| EDC | 50.0% | Chưa có mục tiêu | Tốt | Chưa đủ cơ sở |

Kết luận:

- Không nên tin hoàn toàn các badge màu.
- Cần đọc giá trị thực tế so với mục tiêu.
- CBI là điểm đáng lo nhất nhưng lại đang được gắn badge Tốt.

## 14. Câu chuyện nghiệp vụ rút ra từ Dashboard

Với dữ liệu hiện tại, câu chuyện trải nghiệm khách hàng có thể được tóm tắt như sau:

1. Cả hai khách bước vào cửa hàng với cảm xúc trung tính.
2. Khu vực chờ tạo ra vấn đề rõ nhất:
   - Một khách phân vân.
   - Một khách sốt ruột.
3. Khu vực tư vấn đã cải thiện một khách sang Engaged, nhưng khách còn lại vẫn Confused.
4. Tại khu vực sản phẩm, cả hai khách đều Engaged.
5. Tại quầy thanh toán, cả hai khách đều Delighted.
6. Không có trường hợp Dissatisfied.

Điều này gợi ý:

- Điểm yếu nằm ở giai đoạn đầu: **chờ và tư vấn**.
- Điểm mạnh nằm ở giai đoạn sau: **trải nghiệm sản phẩm và thanh toán**.
- Quy trình hiện có khả năng phục hồi cảm xúc khách từ tiêu cực nhẹ sang tích cực.

## 15. Hành động vận hành được đề xuất

### Ưu tiên 1: cải thiện khu vực chờ

- Hiển thị quy trình và thứ tự phục vụ rõ ràng.
- Cho khách biết thời gian chờ dự kiến.
- Bố trí nhân viên đón tiếp ban đầu.
- Theo dõi thời gian chờ thực tế thay vì chỉ dựa vào biểu cảm.

### Ưu tiên 2: cải thiện nội dung tư vấn

- Chuẩn hóa kịch bản tư vấn ngắn gọn.
- Dùng bảng so sánh sản phẩm dễ hiểu.
- Hạn chế đưa quá nhiều lựa chọn cùng lúc.
- Kiểm tra xem khách đã hiểu trước khi chuyển sang bước tiếp theo.

### Ưu tiên 3: duy trì trải nghiệm tại sản phẩm và thanh toán

- Ghi nhận quy trình nào khiến khách chuyển sang Engaged.
- Duy trì tốc độ và thái độ phục vụ tại checkout.
- Tìm hiểu vì sao một khách rời cửa hàng ở trạng thái Neutral dù từng Delighted tại checkout.

### Ưu tiên 4: chưa ra quyết định lớn từ mẫu hiện tại

Dữ liệu chỉ gồm:

```text
2 khách
12 lần quan sát
1 ngày
```

Nên thu thập thêm trước khi đánh giá nhân viên hoặc thay đổi lịch ca:

- Nhiều ngày.
- Nhiều khung giờ.
- Tối thiểu hàng chục hoặc hàng trăm khách.
- Kết hợp doanh số, thời gian chờ và phản hồi trực tiếp.

## 16. Kết luận ngắn gọn

| Câu hỏi | Kết luận |
|---|---|
| Có bao nhiêu khách? | 2 khách |
| Có bao nhiêu lần quan sát? | 12 mẫu cảm xúc |
| Trải nghiệm tổng thể ra sao? | 50% tích cực, 25% trung tính, 25% có vấn đề |
| Vấn đề lớn nhất là gì? | Phân vân tại khu vực chờ và tư vấn |
| Có khách không hài lòng mạnh không? | Chưa ghi nhận |
| Giai đoạn nào tốt nhất? | Khu vực sản phẩm và quầy thanh toán |
| CBI 16.7% có tốt không? | Không, cao hơn mục tiêu 8% |
| IBI 8.3% có tốt không? | Không, cao hơn mục tiêu 5% |
| EDC 50% có phải 50% khách chuyển đổi không? | Không; hiện chỉ là tỷ trọng Delighted trong nhóm Engaged + Delighted |
| Có nên tin khuyến nghị quá tải ca tối không? | Không, vì bảng đang ghi ca tối 0 khách |
| Có thể dùng dữ liệu để kết luận toàn cửa hàng chưa? | Chưa, mẫu 2 khách quá nhỏ |

