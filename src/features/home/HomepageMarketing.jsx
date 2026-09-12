import { Link } from "react-router-dom";
import { useHomepage } from "../../lib/useHomepage";
import { resolveAssetUrl } from "../../lib/resolveAssetUrl";

// Renders the 7 public marketing sections from GET /api/v1/homepage —
// same content/order a logged-out website visitor sees on "/". Any
// section the admin hasn't configured comes back as null/empty from the
// API and is skipped entirely here (never rendered empty).
export default function HomepageMarketing() {
  const { data, loading, error } = useHomepage();

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        جاري تحميل المحتوى...
      </div>
    );
  }

  if (error || !data) {
    return null; // fail silently — this section is supplementary to the dashboard above it
  }

  return (
    <div className="flex flex-col gap-10 mt-8">
      <HeroSection hero={data.hero} />
      <StudentsCountBar studentsCount={data.students_count} />
      <BannerSection banner={data.banner_one} />
      <LatestCoursesSection latestCourses={data.latest_courses} />
      <FeatureCardsSection featureCards={data.feature_cards} />
      <ReviewsSection reviews={data.reviews} />
      <FaqSection faqs={data.faqs} />
      <BannerSection banner={data.banner_two} />
    </div>
  );
}

// A destination coming back from Button::resolveHref() on the backend is
// either an internal path ("/courses/...") or a full https URL — route
// internal ones through react-router's Link so there's no full page
// reload inside the PWA.
function SmartLink({ href, className, children }) {
  if (!href) return <span className={className}>{children}</span>;
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function HeroSection({ hero }) {
  if (!hero || (!hero.main_title && !hero.image_path && !hero.video_embed_url)) return null;

  return (
    <section className="flex flex-col gap-4 text-center">
      {hero.type === "video" && hero.video_embed_url ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <iframe
            src={hero.video_embed_url}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={hero.main_title || "hero video"}
          />
        </div>
      ) : hero.image_path ? (
        <img
          src={resolveAssetUrl(hero.image_path)}
          alt={hero.main_title || ""}
          className="w-full rounded-xl object-cover"
        />
      ) : null}

      {hero.main_title && <h1 className="text-2xl font-bold">{hero.main_title}</h1>}
      {hero.subtitle && <p className="text-gray-600">{hero.subtitle}</p>}
      {hero.cta_label && hero.cta_href && (
        <SmartLink
          href={hero.cta_href}
          className="mx-auto inline-block rounded-lg bg-primary px-6 py-2 font-semibold text-white"
        >
          {hero.cta_label}
        </SmartLink>
      )}
    </section>
  );
}

function StudentsCountBar({ studentsCount }) {
  if (!studentsCount) return null;
  return (
    <section className="rounded-xl bg-gray-50 py-4 text-center">
      <span className="text-2xl font-bold">{studentsCount.count}</span>{" "}
      <span className="text-gray-600">{studentsCount.title}</span>
    </section>
  );
}

function BannerSection({ banner }) {
  if (!banner) return null;
  return (
    <section
      className="relative overflow-hidden rounded-xl p-6 text-white"
      style={{
        backgroundImage: banner.image_path ? `url(${resolveAssetUrl(banner.image_path)})` : undefined,
        backgroundColor: !banner.image_path ? "#1f2937" : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 flex flex-col items-start gap-2">
        {banner.title && <h3 className="text-xl font-bold">{banner.title}</h3>}
        {banner.description && <p className="max-w-md text-white/90">{banner.description}</p>}
        {banner.button_label && banner.href && (
          <SmartLink
            href={banner.href}
            className="mt-2 inline-block rounded-lg px-5 py-2 font-semibold text-white"
            style={{ backgroundColor: banner.button_color || "#2563eb" }}
          >
            {banner.button_label}
          </SmartLink>
        )}
      </div>
      {banner.image_path && <div className="absolute inset-0 bg-black/30" />}
    </section>
  );
}

function LatestCoursesSection({ latestCourses }) {
  if (!latestCourses || !latestCourses.items?.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{latestCourses.title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {latestCourses.items.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.slug}`}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm"
          >
            {course.thumbnail_path && (
              <img
                src={resolveAssetUrl(course.thumbnail_path)}
                alt={course.title}
                className="aspect-video w-full object-cover"
              />
            )}
            <div className="flex flex-col gap-1 p-3">
              <span className="font-semibold">{course.title}</span>
              {course.short_description && (
                <span className="line-clamp-2 text-sm text-gray-500">{course.short_description}</span>
              )}
              {course.is_free && (
                <span className="w-fit rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  مجاني
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeatureCardsSection({ featureCards }) {
  if (!featureCards?.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">ليه تتعلم معانا</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {featureCards.map((card) => (
          <div key={card.id} className="flex gap-3 rounded-xl border border-gray-100 p-4">
            <FeatureCardIcon card={card} />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{card.title}</span>
              {card.description && <span className="text-sm text-gray-500">{card.description}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// NOTE: icon rendering here is a best-effort default (upload image > raw
// SVG > a plain dot placeholder for a library-icon key). If the site
// already has a shared icon-library renderer somewhere in student-app,
// send it over and this can be swapped to use the same one instead of
// this placeholder.
function FeatureCardIcon({ card }) {
  if (card.icon_upload_path) {
    return (
      <img src={resolveAssetUrl(card.icon_upload_path)} alt="" className="h-10 w-10 shrink-0 object-contain" />
    );
  }
  if (card.icon_svg_code) {
    return (
      <span
        className="h-10 w-10 shrink-0 text-primary [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: card.icon_svg_code }}
      />
    );
  }
  return <span className="h-10 w-10 shrink-0 rounded-full bg-primary/10" />;
}

function ReviewsSection({ reviews }) {
  if (!reviews || !reviews.items?.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{reviews.title}</h2>
      <div className="flex flex-col gap-3">
        {reviews.items.map((review) => (
          <div key={review.id} className="flex gap-3 rounded-xl border border-gray-100 p-4">
            {review.student_photo_path ? (
              <img
                src={resolveAssetUrl(review.student_photo_path)}
                alt={review.student_name}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
            )}
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{review.student_name}</span>
              <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
              <span className="text-sm text-gray-600">{review.review_text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">أسئلة شائعة</h2>
      {faqs.map((faq) => (
        <details key={faq.id} className="rounded-xl border border-gray-100 p-4">
          <summary className="cursor-pointer font-semibold">{faq.question}</summary>
          <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
        </details>
      ))}
    </section>
  );
}
