export function getImageExtension(contentType: string) {
  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export function getImageStoragePath({
  contentType,
  folder,
  userId,
}: {
  contentType: string;
  folder: string;
  userId: string;
}) {
  const extension = getImageExtension(contentType);

  return `${userId}/${folder}/${crypto.randomUUID()}.${extension}`;
}
