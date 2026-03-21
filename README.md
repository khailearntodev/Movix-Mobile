# Movix Mobile App 📱

Ứng dụng di động của nền tảng xem phim **Movix**, được xây dựng đa nền tảng (iOS & Android) bằng **React Native** và hệ sinh thái **Expo**. Ứng dụng cung cấp trải nghiệm tuyệt vời cho người dùng phát lại video, theo dõi thông tin nghệ sĩ và đặc biệt là tính năng **Watch Party** (Xem Chung) đồng bộ theo thời gian thực.

## 🌟 Tính Năng Nổi Bật

- **Khám phá Phim ảnh:** Danh sách phim, TV Show đa dạng, phân trang mượt mà.
- **Tìm kiếm & Bộ lọc:** Tìm kiếm và lọc nghệ sĩ (People), phim theo vai trò (Đạo diễn, Diễn viên).
- **Hồ sơ Nghệ sĩ:** Xem chi tiết tự tiểu sử, vai trò, và các bộ phim đã tham gia.
- **🎬 Watch Party (Khán phòng Xem Chung):**
  - **Real-time Sync:** Đồng bộ chuẩn xác việc Play/Pause và Seek (tua video) giữa chủ phòng (Host) và thành viên thông qua WebSockets.
  - **Live Chat:** Trò chuyện trực tiếp, chia sẻ cảm nghĩ tức thời.
  - **Kiểm soát Phòng (Host Controls):** Chủ phòng có thể duyệt yêu cầu xin vào phòng (Join Requests), mời người khác ra khỏi phòng (Kick), cấm vĩnh viễn (Ban) thành viên hoặc chuyển quyền Host tùy thích.
  - **Invites:** Dễ dàng tạo và copy mã Join Code cho phòng Private hoặc URL cho phòng Public.
- **Và nhiều chức năng khác!** 

## 🛠 Tech Stack (Công nghệ sử dụng)

Dự án sử dụng các thư viện hỗ trợ tối ưu hiện đại nhất cho Mobile:

- **Framework:** [React Native](https://reactnative.dev/) (v0.81) & [Expo](https://expo.dev/) (SDK 54)
- **Ngôn ngữ:** TypeScript
- **Styling:** [NativeWind](https://www.nativewind.dev/) (dùng 문 pháp Tailwind CSS thẳng trong RN)
- **Điều hướng:** React Navigation v7 (Bottom Tabs, Native Stack) 
- **Video Player:** `expo-av`
- **Realtime / WebSockets:** `socket.io-client`
- **Icons UI:** `lucide-react-native`
- **Lưu trữ Cục bộ:** `@react-native-async-storage/async-storage`
- **Call API Networking:** Axios

## 🚀 Hướng Dẫn Cài Đặt và Chạy Cục Bộ

### 1. Yêu cầu môi trường
- Node.js (Nên dùng phiên bản LTS v20+)
- Gói package manager `npm` hoặc `yarn`.
- Ứng dụng **Expo Go** trên thiết bị thật (Tải từ AppStore/CH Play) HOẶC Trình giả lập (Android Emulator / iOS Simulator).

### 2. Cài đặt các thư viện (Dependencies)
```bash
cd Movix-Mobile
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc của dự án `Movix-Mobile` dựa theo Backend đang chạy.
*(Giả sử Backend chạy Cổng 5000).*
```env
API_URL=http://<YOUR_LOCAL_IP>:5000/api
SOCKET_URL=http://<YOUR_LOCAL_IP>:5000
```

### 4. Khởi chạy Ứng dụng
Vẫn đứng tại Terminal của `Movix-Mobile`, chạy lệnh sau để bật Metro Bundler (nhớ dọn cache):
```bash
npx expo start -c
```

- **Trên máy thật:** Bật app Expo Go lên => Quét mã QR hiện trong terminal.

## 🏗 Cấu trúc Thư mục

- `/src/app/` : Chứa các màn hình (Screens) chính.
- `/src/components/` : Chứa Module, UI Component dùng nhiều lần.
- `/src/contexts/` : Quản lý trạng thái Global bằng Context API (VD: `AuthContext`).
- `/src/navigation/` : Thiết lập định tuyến Stack/Tabs.
- `/src/services/` : Nơi định nghĩa các hàm gọi API đến Server (Axios Instance).
- `/src/types/` : Interface và Schema TypeScript.
- `/src/utils/` : Các hàm Helper tiện ích (như convert định dạng giờ, lưu dữ liệu LocalStorage).

---