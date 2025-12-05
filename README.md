
# Affiliate Content Factory

Đây là công cụ giúp bạn tạo kịch bản video TikTok/Shorts/Reels tự động từ nội dung của đối thủ bằng AI.

## 1. Yêu cầu chuẩn bị
Trước khi bắt đầu, bạn cần có 2 chìa khoá (API Key):
1. **Google Gemini API Key:** Lấy tại [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **OpenAI API Key:** Lấy tại [OpenAI Platform](https://platform.openai.com/api-keys) (Cần nạp credit khoảng 5$ để dùng).

## 2. Cài đặt trên máy tính (Local)

**Bước 1:** Tải mã nguồn về máy.
- Bấm nút xanh **Code** -> **Download ZIP** trên GitHub và giải nén.

**Bước 2:** Cài đặt môi trường.
- Bạn cần cài [Node.js](https://nodejs.org/) (chọn bản LTS).
- Mở Terminal (trên Mac) hoặc CMD/PowerShell (trên Windows).
- Gõ lệnh `cd` vào thư mục vừa giải nén. Ví dụ:
  ```bash
  cd Downloads/affiliate-content-factory
  ```
- Gõ lệnh cài đặt thư viện:
  ```bash
  npm install
  ```

**Bước 3:** Cấu hình API Key.
- Trong thư mục code, tạo một file mới tên là `.env.local`.
- Mở file đó bằng Notepad/TextEdit và dán nội dung sau vào:
  ```
  GEMINI_API_KEY=dán_mã_của_bạn_vào_đây
  OPENAI_API_KEY=dán_mã_của_bạn_vào_đây
  ```
- Lưu file lại.

**Bước 4:** Chạy ứng dụng.
- Quay lại màn hình đen (Terminal), gõ:
  ```bash
  npm run dev
  ```
- Mở trình duyệt web, truy cập: `http://localhost:3000`.

## 3. Deploy lên Internet (Vercel)

Đây là cách dễ nhất để chia sẻ app cho người khác dùng.

1. Đẩy code này lên GitHub cá nhân của bạn.
2. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
3. Bấm **"Add New..."** -> **"Project"**.
4. Chọn repo `affiliate-content-factory` bạn vừa up.
5. Tại mục **Environment Variables**, bạn cần thêm 2 biến:
   - Tên: `GEMINI_API_KEY` - Giá trị: (Mã Gemini của bạn)
   - Tên: `OPENAI_API_KEY` - Giá trị: (Mã OpenAI của bạn)
6. Bấm **Deploy**. Chờ khoảng 1 phút là xong!

---

## Các lỗi thường gặp và cách sửa

1. **Lỗi 500 (Internal Server Error):**
   - **Nguyên nhân:** Thường do quên điền API Key hoặc API Key bị sai/hết tiền.
   - **Sửa:** Kiểm tra file `.env.local` (nếu chạy local) hoặc mục Settings trên Vercel. Kiểm tra tài khoản OpenAI có còn credit không.

2. **Lỗi Gemini không trả về kết quả:**
   - **Nguyên nhân:** Nội dung đầu vào quá ngắn hoặc vi phạm chính sách nội dung.
   - **Sửa:** Thử dán nội dung dài hơn một chút.

3. **Lỗi "Model not found" (OpenAI):**
   - **Nguyên nhân:** Tài khoản mới chưa nạp tiền không được dùng model `gpt-4`.
   - **Sửa:** Vào code `pages/api/generate.js`, đổi `gpt-4o` thành `gpt-3.5-turbo` (nhưng chất lượng sẽ kém hơn).

4. **Lỗi Timeout (Vercel):**
   - **Nguyên nhân:** AI suy nghĩ quá lâu (quá 10 giây trên gói Free).
   - **Sửa:** Vercel gói Free giới hạn 10s. Bạn có thể cần nâng cấp Vercel Pro hoặc tối ưu lại prompt ngắn hơn.

5. **Kết quả trả về bị lỗi font/format:**
   - **Sửa:** App đã có cơ chế làm sạch JSON, nhưng thỉnh thoảng AI vẫn trả về text thường. Hãy thử bấm Generate lại lần nữa.
