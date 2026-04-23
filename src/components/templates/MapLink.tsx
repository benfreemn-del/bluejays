"use client";

import { normalizeAddress } from "@/lib/address-normalizer";

/**
 * Wraps an address in a clickable Google Maps link.
 * Critical for mobile — users tap to get directions instantly.
 */
export function MapLink({
  address,
  className = "",
  children,
  style,
}: {
  address: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const normalizedAddress = normalizeAddress(address) || address;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(normalizedAddress)}`;
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`hover:underline transition-colors ${className}`}
      style={style}
    >
      {children || normalizedAddress}
    </a>
  );
}

/**
 * Wraps a phone number in a clickable tel: link.
 */
export function PhoneLink({
  phone,
  className = "",
  children,
  style,
}: {
  phone: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const cleanPhone = phone.replace(/[^+\d]/g, "");
  return (
    <a
      href={`tel:${cleanPhone}`}
      className={`hover:underline transition-colors ${className}`}
      style={style}
    >
      {children || phone}
    </a>
  );
}
