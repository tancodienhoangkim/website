'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

type Props = {
  titleDefault?: string;
  source?: 'contact' | 'consultation' | 'quote';
  formId?: string;
};

export function ContactFormClient({
  titleDefault = 'Gửi yêu cầu tư vấn (Chân Trang)',
  source = 'contact',
  formId = 'footer_contact',
}: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      fullName: String(data.get('full_name') ?? ''),
      phone: String(data.get('phone') ?? ''),
      email: String(data.get('email') ?? ''),
      content: String(data.get('content[contact_content]') ?? ''),
      source,
      title: String(data.get('title') ?? titleDefault),
    };
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(json.error ?? 'Gửi thất bại, vui lòng thử lại.');
        return;
      }
      setStatus('sent');
      setMessage('Cảm ơn! Chúng tôi sẽ liên hệ trong 24h.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Lỗi kết nối, vui lòng thử lại.');
    }
  }

  const btnLabel = status === 'sending' ? 'Đang gửi…' : status === 'sent' ? 'Đã gửi' : 'Đăng ký';

  return (
    <form
      id={formId}
      className="frm-required form-contact"
      onSubmit={onSubmit}
      noValidate
    >
      <input
        className="form-control hidden"
        type="text"
        name="title"
        defaultValue={titleDefault}
        aria-label="Tiêu đề yêu cầu"
        readOnly
      />

      <div className="form-group">
        <label htmlFor={`${formId}_full_name`} className="sr-only">
          Họ và tên
        </label>
        <input
          id={`${formId}_full_name`}
          className="form-control required"
          type="text"
          name="full_name"
          placeholder="Họ và tên"
          aria-label="Họ và tên"
          aria-required="true"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${formId}_phone`} className="sr-only">
          Số điện thoại
        </label>
        <input
          id={`${formId}_phone`}
          className="form-control required"
          type="tel"
          name="phone"
          placeholder="Số điện thoại"
          aria-label="Số điện thoại"
          aria-required="true"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${formId}_email`} className="sr-only">
          Email
        </label>
        <input
          id={`${formId}_email`}
          className="form-control"
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${formId}_content`} className="sr-only">
          Ghi chú
        </label>
        <textarea
          id={`${formId}_content`}
          className="form-control"
          name="content[contact_content]"
          placeholder="Ghi chú"
          aria-label="Ghi chú"
          rows={1}
        />
      </div>

      <div className="form-group list-button">
        <div className="btn-content">
          <button
            type="submit"
            className="btn btn-submit backgroud-border-gr"
            disabled={status === 'sending' || status === 'sent'}
            aria-label="Đăng ký tư vấn"
          >
            <span className="name">{btnLabel}</span>
          </button>
        </div>
        {message ? (
          <p
            className={
              status === 'sent'
                ? 'contact-status contact-status-success'
                : 'contact-status contact-status-error'
            }
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
