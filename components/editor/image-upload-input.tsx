"use client";

import { Input } from "@/components/ui/input";

type ImageUploadInputProps = {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (url: string) => void;
};

/**
 * Image field — URL only.
 *
 * The editor deliberately ships no storage provider. Uploading means picking
 * one (UploadThing, S3, Cloudinary, a route handler of your own), and a
 * component library should not make that choice for the host app. A button
 * that produced a `data:` URL instead would be worse than none: it inlines
 * megabytes of base64 into an email that most clients then refuse to render.
 *
 * To add uploading, wrap this field: keep the URL input, add your own button,
 * and call `onChange` with the URL your storage returns.
 */
export function ImageUploadInput({
  id,
  value,
  placeholder,
  onChange,
}: ImageUploadInputProps) {
  return (
    <Input
      id={id}
      type="url"
      value={value}
      placeholder={placeholder ?? "https://..."}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
