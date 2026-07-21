import service from "../public/pages/assets/wm-service.png";
import product from "../public/pages/assets/wm-product.png";
import space from "../public/pages/assets/wm-space.png";

declare global {
  interface Window {
    WM_CARD_IMAGES?: Record<"service" | "product" | "space", string>;
  }
}

window.WM_CARD_IMAGES = {
  service: service as unknown as string,
  product: product as unknown as string,
  space: space as unknown as string,
};
