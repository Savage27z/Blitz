import { gsap, ScrollTrigger } from "./gsap";

export function splitTextReveal(
  element: HTMLElement,
  options?: {
    trigger?: HTMLElement | string;
    start?: string;
    delay?: number;
    stagger?: number;
    duration?: number;
    scrub?: boolean;
  }
) {
  const text = element.textContent || "";
  const words = text.split(/\s+/).filter(Boolean);

  element.innerHTML = "";
  element.style.overflow = "hidden";

  const wordSpans: HTMLSpanElement[] = [];

  words.forEach((word, i) => {
    const wrapper = document.createElement("span");
    wrapper.style.display = "inline-block";
    wrapper.style.overflow = "hidden";
    wrapper.style.verticalAlign = "top";

    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.textContent = word;
    inner.style.transform = "translateY(110%)";

    wrapper.appendChild(inner);
    element.appendChild(wrapper);

    if (i < words.length - 1) {
      const space = document.createTextNode(" ");
      element.appendChild(space);
    }

    wordSpans.push(inner);
  });

  const tl = gsap.timeline({
    scrollTrigger: options?.trigger
      ? {
          trigger: options.trigger,
          start: options?.start || "top 80%",
          toggleActions: "play none none none",
        }
      : undefined,
    delay: options?.delay || 0,
  });

  tl.to(wordSpans, {
    y: "0%",
    duration: options?.duration || 0.8,
    stagger: options?.stagger || 0.04,
    ease: "power3.out",
  });

  return tl;
}

export function fadeInUp(
  element: HTMLElement | HTMLElement[],
  options?: {
    trigger?: HTMLElement | string;
    start?: string;
    delay?: number;
    duration?: number;
    y?: number;
  }
) {
  return gsap.from(element, {
    opacity: 0,
    y: options?.y || 40,
    duration: options?.duration || 0.8,
    delay: options?.delay || 0,
    ease: "power3.out",
    scrollTrigger: options?.trigger
      ? {
          trigger: options.trigger,
          start: options?.start || "top 80%",
          toggleActions: "play none none none",
        }
      : undefined,
  });
}

export function countUp(
  element: HTMLElement,
  endValue: number,
  options?: {
    trigger?: HTMLElement | string;
    start?: string;
    duration?: number;
    suffix?: string;
    prefix?: string;
  }
) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration: options?.duration || 1.5,
    ease: "power2.out",
    scrollTrigger: options?.trigger
      ? {
          trigger: options.trigger,
          start: options?.start || "top 80%",
          toggleActions: "play none none none",
        }
      : undefined,
    onUpdate: () => {
      element.textContent = `${options?.prefix || ""}${Math.round(obj.val)}${options?.suffix || ""}`;
    },
  });
}
