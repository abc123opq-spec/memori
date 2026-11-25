import { HostConfig_webPath } from "./webPath";

export function ImagePreloader_preload(rawUrl: string): Promise<HTMLImageElement> {
  const url = HostConfig_webPath(rawUrl);
  if (ImagePreloader_images[url]) {
    return Promise.resolve(ImagePreloader_images[url]);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      ImagePreloader_images[url] = img;
      resolve(img);
    };
  });
}

export function ImagePreloader_uri(path: string): string {
  return HostConfig_webPath(path);
}

export function ImagePreloader_clear(): void {}

export const ImagePreloader_dynocoach: string = HostConfig_webPath("/images/dinocoach.svg");

export const ImagePreloader_dynoflex: string = HostConfig_webPath("/images/dinoflex.svg");

export const ImagePreloader_dynohappy: string = HostConfig_webPath("/images/dinohappy.svg");

export const ImagePreloader_images: Record<string, HTMLImageElement> = {};
