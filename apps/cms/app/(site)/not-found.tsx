import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
      }}
    >
      <h1 style={{ fontSize: '80px', fontWeight: 700, color: '#6b0f1a', margin: 0, lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#333', marginTop: '16px' }}>
        Trang không tồn tại
      </h2>
      <p style={{ color: '#666', marginTop: '8px', maxWidth: '400px' }}>
        Trang bạn tìm kiếm đã bị xóa hoặc chưa được tạo. Vui lòng quay về trang chủ.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '32px',
          display: 'inline-block',
          padding: '12px 32px',
          background: '#6b0f1a',
          color: '#D4AF5A',
          fontWeight: 600,
          borderRadius: '4px',
          textDecoration: 'none',
          letterSpacing: '0.5px',
        }}
      >
        Về trang chủ
      </Link>
    </div>
  );
}
