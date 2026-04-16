import { getSiteSettings } from '../../lib/queries';
import {
  ArrowRight,
  Comments,
  Facebook,
  Gift,
  Headphones,
  PaperPlane,
  Phone,
  Youtube,
  Zalo,
} from '../icons';

export async function FloatingWidgets() {
  const settings = await getSiteSettings();
  const s = settings as any;
  const hotline: string = s?.hotline ?? '0971.199.817';
  const social: {
    facebook?: string;
    youtube?: string;
    zaloPhone?: string;
    messengerPageId?: string;
  } = s?.social ?? {};

  const phoneHref = 'tel:' + hotline.replace(/\s/g, '');
  const zaloNumber = (social.zaloPhone ?? hotline).replace(/\D/g, '');
  const zaloUrl = 'https://zalo.me/' + zaloNumber;
  const facebookUrl = social.facebook ?? 'https://facebook.com/hoangkim';
  const youtubeUrl = social.youtube ?? 'https://youtube.com/@hoangkim';

  return (
    <>
      {/* Desktop sticky cluster — right edge, ≥768px */}
      <div className="scoll-right-bottom" style={{ zIndex: 999 }}>
        <div className="btn-scoll-bottom">
          <div id="btn-nha-mau" className="item-scoll item-nhan-nha backgroud-border-gr">
            <a
              className="btn-nha-mau"
              href="/dang-ky-nhan-mau-nha"
              target="_blank"
              rel="nofollow noreferrer"
              aria-label="Đăng ký nhận nhà mẫu"
            >
              <span>Nhận nhà mẫu</span>
              <PaperPlane size={18} className="icon-on-gold" />
            </a>
          </div>
          <div id="btn-gift" className="item-scoll backgroud-border-gr">
            <a
              className="btn-gift"
              href="/gui-yeu-cau-tu-van"
              target="_blank"
              rel="nofollow noreferrer"
              aria-label="Gửi yêu cầu tư vấn"
            >
              <Gift size={18} className="icon-on-gold" />
            </a>
          </div>
          <div id="btn-fanpage" className="item-scoll backgroud-border-gr">
            <a
              className="btn-fanpage"
              href={facebookUrl}
              target="_blank"
              rel="nofollow noreferrer"
              aria-label="Fanpage Tân cổ điển Hoàng Kim"
            >
              <Facebook size={18} className="icon-on-gold" />
            </a>
          </div>
          <div id="btn-youtube" className="item-scoll backgroud-border-gr">
            <a
              className="btn-youtube"
              href={youtubeUrl}
              target="_blank"
              rel="nofollow noreferrer"
              aria-label="Kênh Youtube Tân cổ điển Hoàng Kim"
            >
              <Youtube size={18} className="icon-on-gold" />
            </a>
          </div>
          <div id="btn-zalo" className="item-scoll backgroud-border-gr">
            <a
              className="btn-zalo"
              href={zaloUrl}
              target="_blank"
              rel="nofollow noreferrer"
              aria-label="Zalo Tân cổ điển Hoàng Kim"
            >
              <Zalo size={18} className="icon-on-gold" />
            </a>
          </div>
        </div>
        <div className="btn-scoll-top backgroud-border-gr">
          <ArrowRight size={18} className="icon-on-gold" />
        </div>
      </div>

      {/* Mobile bottom bar — <768px */}
      <div className="scoll-bottom-mobile">
        <ul>
          <li>
            <a
              className="btn-zalo-mobile"
              href={zaloUrl}
              target="_blank"
              rel="nofollow noreferrer"
              aria-label="Zalo Tân cổ điển Hoàng Kim"
            >
              <Zalo size={20} className="icon-on-gold" />
              <span>Zalo</span>
            </a>
          </li>
          <li>
            <a
              className="btn-hotline-mobile"
              href={phoneHref}
              rel="nofollow"
              aria-label="Hotline Tân cổ điển Hoàng Kim"
            >
              <Phone size={20} className="icon-on-gold" />
              <span>Hotline</span>
            </a>
          </li>
          <li>
            <a
              href="/gui-yeu-cau-tu-van"
              className="btn-goi-lai"
              aria-label="Yêu cầu gọi lại"
              rel="nofollow noreferrer"
              target="_blank"
            >
              <Headphones size={20} className="icon-on-gold" />
              <span>Y/c Gọi lại</span>
            </a>
          </li>
          <li>
            <a
              className="btn-gift"
              href="/gui-yeu-cau-tu-van"
              target="_blank"
              rel="nofollow noreferrer"
              aria-label="Ưu Đãi"
            >
              <div className="button_gift_box animate__heartBeat">
                <Gift size={18} className="icon-on-gold" />
              </div>
              <span style={{ marginTop: 0 }}>Ưu Đãi</span>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
