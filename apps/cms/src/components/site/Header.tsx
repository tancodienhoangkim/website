import Link from 'next/link';
import Image from 'next/image';
import { getHeader, getSiteSettings } from '../../lib/queries';
import { AngleDown, Phone, Search } from '../icons';

type NavChild = { label: string; url: string };
type NavItem = { label: string; url: string; children?: NavChild[] };

function NavLi({ item }: { item: NavItem }) {
  const kids = item.children ?? [];
  const hasKids = kids.length > 0;
  return (
    <li className={hasKids ? 'wsmenu-item-has-children' : undefined}>
      <Link href={item.url} className="navtext">
        {item.label}
        {hasKids ? (
          <>
            {' '}
            <AngleDown />
          </>
        ) : null}
      </Link>
      {hasKids ? (
        <ul className="wsmenu-submenu">
          {kids.map((c, j) => (
            <li key={j}>
              <Link href={c.url}>{c.label}</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export async function Header() {
  const [header, settings] = await Promise.all([getHeader(), getSiteSettings()]);
  const h = header as any;
  const s = settings as any;
  const hotline = s?.hotline ?? '0966 885 000';
  const left: NavItem[] = h?.leftMenu ?? [];
  const right: NavItem[] = h?.rightMenu ?? [];

  return (
    <div id="header" className="nh-row">
      <div id="header-row-48" className="nh-row header-top nav-down">
        <div className="container">
          <div className="row">
            {/* Left column: wsmenu nav */}
            <div className="col-sm-5 col-xs-5">
              <div className="wsmenucontainer clearfix menu-fix-mobile">
                <div className="overlapblackbg"></div>
                <div className="wsmobileheader clearfix">
                  <a id="wsnavtoggle" className="animated-arrow" rel="nofollow">
                    <span></span>
                  </a>
                </div>
                <div className="webslidemenu-horizontal">
                  <div className="wsmain">
                    <div className="logo-menu">
                      <Link href="/">
                        <Image
                          src="/vendor/images/logo.jpg"
                          className="logo-menu"
                          alt="Logo Tân cổ điển Hoàng Kim"
                          width={180}
                          height={60}
                          priority
                        />
                      </Link>
                    </div>
                    <nav className="wsmenu clearfix" aria-label="Điều hướng chính">
                      <ul className="mobile-sub wsmenu-list">
                        {left.map((item, i) => (
                          <NavLi key={i} item={item} />
                        ))}
                        {right.map((item, i) => (
                          <NavLi key={left.length + i} item={item} />
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>

              {/* Info: phone + email */}
              <div className="info-company">
                <ul>
                  <li>
                    <a href={`tel:${hotline.replace(/\s/g, '')}`}>
                      <Phone />
                      {' '}
                      {hotline}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Centre column: logo */}
            <div className="col-sm-2 col-xs-2">
              <div className="navbar-header">
                <Link className="logo" href="/">
                  <Image
                    src="/vendor/images/logo.jpg"
                    alt="Logo Tân cổ điển Hoàng Kim"
                    width={180}
                    height={60}
                    priority
                  />
                </Link>
              </div>
            </div>

            {/* Right column: search */}
            <div className="col-sm-5 col-xs-5">
              <div className="box-search pull-right">
                <form
                  className="form-inline"
                  action="/search/products/basic-search-product"
                  method="get"
                >
                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        name="keyword"
                        placeholder="Tìm kiếm"
                        aria-label="Tìm kiếm"
                      />
                      <button
                        type="submit"
                        className="btn btn-search btn-main btn-submit"
                        aria-label="Tìm kiếm"
                      >
                        <Search />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: desktop menu split left/right with centre logo (≥1200px) */}
      <div id="header-row-98" className="nh-row header-main header-row-tablet">
        <div className="container">
          <div className="row">
            <div className="col-sm-5 col-xs-5">
              <div className="wsmenucontainer clearfix menu-left-right-pc">
                <div className="overlapblackbg"></div>
                <div className="webslidemenu-horizontal">
                  <div className="wsmain">
                    <nav className="wsmenu clearfix" aria-label="Điều hướng chính (trái)">
                      <ul className="mobile-sub wsmenu-list">
                        {left.map((item, i) => (
                          <NavLi key={i} item={item} />
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-2 col-xs-2">
              <div className="navbar-header">
                <h1>
                  <Link className="logo" href="/">
                    <Image
                      src="/vendor/images/logo.jpg"
                      alt="Logo Tân cổ điển Hoàng Kim"
                      width={180}
                      height={60}
                      priority
                    />
                  </Link>
                </h1>
              </div>
            </div>
            <div className="col-sm-5 col-xs-5">
              <div className="wsmenucontainer clearfix menu-left-right-pc">
                <div className="overlapblackbg"></div>
                <div className="webslidemenu-horizontal">
                  <div className="wsmain">
                    <nav className="wsmenu clearfix" aria-label="Điều hướng chính (phải)">
                      <ul className="mobile-sub wsmenu-list">
                        {right.map((item, i) => (
                          <NavLi key={i} item={item} />
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
