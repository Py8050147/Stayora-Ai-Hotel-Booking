import type { Models } from "../prisma/contract";

type Decimal = string | number;

export function serializeDecimal(value: Decimal): string {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value;
}

export function parseDecimal(value: string | number): number {
  if (typeof value === "number") {
    return value;
  }
  return parseFloat(value);
}

export function serializeHotel(hotel: Models["public_Hotel"] & {
  address?: (Models["public_Address"])[];
  images?: (Models["public_HotelImage"])[];
  amenities?: (Models["public_HotelAmenity"] & { amenity: Models["public_Amenity"] })[];
  roomTypes?: (Models["public_RoomType"])[];
  _count?: { reviews: number; roomTypes: number };
}) {
  return {
    ...hotel,
    starRating: hotel.starRating ?? null,
    address: hotel.address?.[0] ?? null,
    images: hotel.images?.map((img) => ({
      ...img,
      imageUrl: img.imageUrl,
    })) ?? [],
    amenities: hotel.amenities?.map((ha) => ({
      id: ha.amenity.id,
      name: ha.amenity.name,
      icon: ha.amenity.icon,
      category: ha.amenity.category,
    })) ?? [],
    roomTypes: hotel.roomTypes?.map((rt) => ({
      ...rt,
      basePrice: serializeDecimal(rt.basePrice),
      maxAdults: rt.maxAdults,
      maxChildren: rt.maxChildren,
    })) ?? [],
    reviewCount: hotel._count?.reviews ?? 0,
    roomTypeCount: hotel._count?.roomTypes ?? 0,
  };
}

export function serializeHotelDetail(hotel: Models["public_Hotel"] & {
  address?: (Models["public_Address"])[];
  images?: (Models["public_HotelImage"])[];
  amenities?: (Models["public_HotelAmenity"] & { amenity: Models["public_Amenity"] })[];
  roomTypes?: (Models["public_RoomType"] & {
    inventory?: (Models["public_RoomInventory"])[];
  })[];
  reviews?: (Models["public_Review"] & { user: Models["public_User"] })[];
  owner?: Models["public_User"];
}) {
  return {
    ...hotel,
    starRating: hotel.starRating ?? null,
    address: hotel.address?.[0] ?? null,
    images: hotel.images?.map((img) => ({
      ...img,
      imageUrl: img.imageUrl,
    })) ?? [],
    amenities: hotel.amenities?.map((ha) => ({
      id: ha.amenity.id,
      name: ha.amenity.name,
      icon: ha.amenity.icon,
      category: ha.amenity.category,
    })) ?? [],
    roomTypes: hotel.roomTypes?.map((rt) => ({
      ...rt,
      basePrice: serializeDecimal(rt.basePrice),
      maxAdults: rt.maxAdults,
      maxChildren: rt.maxChildren,
      inventory: rt.inventory?.map((inv) => ({
        ...inv,
        price: serializeDecimal(inv.price),
      })) ?? [],
    })) ?? [],
    reviews: hotel.reviews?.map((r) => ({
      ...r,
      user: {
        id: r.user.id,
        name: r.user.name,
      },
    })) ?? [],
    owner: hotel.owner
      ? {
          id: hotel.owner.id,
          name: hotel.owner.name,
          email: hotel.owner.email,
        }
      : null,
  };
}

export function serializeBooking(booking: Models["public_Booking"] & {
  roomLines?: (Models["public_BookingRoom"])[];
  payments?: (Models["public_Payment"])[];
  hotel?: Models["public_Hotel"] & { images?: Models["public_HotelImage"][] };
  user?: Models["public_User"];
  coupon?: Models["public_Coupon"] | null;
  review?: Models["public_Review"] | null;
}) {
  return {
    ...booking,
    subtotal: serializeDecimal(booking.subtotal),
    tax: serializeDecimal(booking.tax),
    discount: serializeDecimal(booking.discount),
    totalAmount: serializeDecimal(booking.totalAmount),
    roomLines: booking.roomLines?.map((rl) => ({
      ...rl,
      pricePerNight: serializeDecimal(rl.pricePerNight),
      subtotal: serializeDecimal(rl.subtotal),
    })) ?? [],
    payments: booking.payments?.map((p) => ({
      ...p,
      amount: serializeDecimal(p.amount),
    })) ?? [],
    hotel: booking.hotel
      ? {
          ...booking.hotel,
          images: booking.hotel.images?.map((img) => ({
            ...img,
            imageUrl: img.imageUrl,
          })) ?? [],
        }
      : null,
    user: booking.user
      ? {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone,
        }
      : null,
    coupon: booking.coupon
      ? {
          ...booking.coupon,
          discountValue: serializeDecimal(booking.coupon.discountValue),
        }
      : null,
    review: booking.review ?? null,
  };
}

export function serializeRoomType(roomType: Models["public_RoomType"] & {
  inventory?: Models["public_RoomInventory"][];
  hotel?: Models["public_Hotel"];
}) {
  return {
    ...roomType,
    basePrice: serializeDecimal(roomType.basePrice),
    inventory: roomType.inventory?.map((inv) => ({
      ...inv,
      price: serializeDecimal(inv.price),
    })) ?? [],
  };
}

export function serializeReview(review: Models["public_Review"] & {
  user?: Models["public_User"];
  hotel?: Models["public_Hotel"];
  booking?: Models["public_Booking"];
}) {
  return {
    ...review,
    user: review.user
      ? {
          id: review.user.id,
          name: review.user.name,
        }
      : null,
    hotel: review.hotel
      ? {
          id: review.hotel.id,
          name: review.hotel.name,
        }
      : null,
    booking: review.booking
      ? {
          id: review.booking.id,
          bookingNumber: review.booking.bookingNumber,
        }
      : null,
  };
}

export function serializePayment(payment: Models["public_Payment"] & {
  booking?: Models["public_Booking"];
  user?: Models["public_User"];
  refunds?: Models["public_Refund"][];
}) {
  return {
    ...payment,
    amount: serializeDecimal(payment.amount),
    refunds: payment.refunds?.map((r) => ({
      ...r,
      amount: serializeDecimal(r.amount),
    })) ?? [],
  };
}

export function serializeCoupon(coupon: Models["public_Coupon"]) {
  return {
    ...coupon,
    discountValue: serializeDecimal(coupon.discountValue),
    minAmount: coupon.minAmount ? serializeDecimal(coupon.minAmount) : null,
    maxDiscount: coupon.maxDiscount ? serializeDecimal(coupon.maxDiscount) : null,
  };
}

export function serializeNotification(notification: Models["public_Notification"]) {
  return {
    ...notification,
  };
}