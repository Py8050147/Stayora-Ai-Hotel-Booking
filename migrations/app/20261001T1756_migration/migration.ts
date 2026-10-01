#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b48a0244aacc9fa64d8bdffc12c9e9497113a2217964c2da0785d5d452e13663/contract';
import endContract from '../../snapshots/b48a0244aacc9fa64d8bdffc12c9e9497113a2217964c2da0785d5d452e13663/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/bf807aa8e0fa8902a448567426c6651ab7a471b2af1aaf043d8830a33fa7f536/contract';
import startContract from '../../snapshots/bf807aa8e0fa8902a448567426c6651ab7a471b2af1aaf043d8830a33fa7f536/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropTable({ schema: 'public', table: 'User' }),
      this.createTable({
        schema: 'public',
        table: 'addresses',
        columns: [
          col('address_line', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('country', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('hotel_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('latitude', 'numeric(9,6)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 9, scale: 6 } },
          }),
          col('longitude', 'numeric(9,6)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 9, scale: 6 } },
          }),
          col('postal_code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('state', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'amenities',
        columns: [
          col('category', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'booking_rooms',
        columns: [
          col('booking_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('nights', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('price_per_night', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('room_type_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('subtotal', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'bookings',
        columns: [
          col('adults', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('booking_number', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('cancel_reason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('cancelled_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('check_in', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('check_out', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('children', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('coupon_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('discount', 'numeric(10,2)', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('hold_expires_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('hotel_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('payment_status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('rooms', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subtotal', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('tax', 'numeric(10,2)', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('total_amount', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'bookings_payment_status_check_e36f7f9e',
            "\"payment_status\" IN ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')",
          ),
          checkExpression(
            'bookings_status_check_77e76a7c',
            "\"status\" IN ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'REFUNDED', 'EXPIRED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'coupons',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('discount_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('discount_value', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('usage_limit', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('used_count', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('valid_from', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('valid_to', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'coupons_discount_type_check_8c8ea4be',
            "\"discount_type\" IN ('PERCENTAGE', 'FIXED_AMOUNT')",
          ),
          checkExpression(
            'coupons_status_check_eb55a64b',
            "\"status\" IN ('DRAFT', 'ACTIVE', 'EXPIRED', 'DISABLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'favorites',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('hotel_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'hotel_amenities',
        columns: [
          col('amenity_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('hotel_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['hotel_id', 'amenity_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'hotel_images',
        columns: [
          col('hotel_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('image_url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_primary', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('sort_order', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'hotels',
        columns: [
          col('check_in_time', 'text', {
            notNull: true,
            default: lit('14:00'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('check_out_time', 'text', {
            notNull: true,
            default: lit('11:00'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('owner_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('star_rating', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'hotels_status_check_0c3a2ffa',
            "\"status\" IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'notifications',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('read_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'notifications_type_check_c77e24ed',
            "\"type\" IN ('BOOKING', 'PAYMENT', 'CANCELLATION', 'REFUND', 'PROMOTION', 'SYSTEM')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'payments',
        columns: [
          col('amount', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('booking_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('INR'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('order_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paid_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('provider', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('transaction_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'payments_status_check_c6292004',
            "\"status\" IN ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'refunds',
        columns: [
          col('amount', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('payment_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('provider_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('refunded_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'reviews',
        columns: [
          col('booking_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('comment', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('hotel_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('rating', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'reviews_status_check_ba5fd2ab',
            "\"status\" IN ('PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'room_inventory',
        columns: [
          col('available_rooms', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('date', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('is_closed', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('price', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('room_type_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'room_types',
        columns: [
          col('base_price', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('bed_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('hotel_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('max_adults', 'int4', {
            notNull: true,
            default: lit(2),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('max_children', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('total_rooms', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'room_types_bed_type_check_e9ae1490',
            "\"bed_type\" IN ('SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'TWIN', 'BUNK')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('clerk_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password_hash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('CUSTOMER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'users_role_check_529998aa',
            "\"role\" IN ('CUSTOMER', 'HOTEL_OWNER', 'HOTEL_MANAGER', 'ADMIN')",
          ),
          checkExpression(
            'users_status_check_3a7c0f48',
            "\"status\" IN ('ACTIVE', 'SUSPENDED', 'DELETED')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'addresses',
        constraint: 'addresses_hotel_id_key',
        columns: ['hotel_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'amenities',
        constraint: 'amenities_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'bookings',
        constraint: 'bookings_booking_number_key',
        columns: ['booking_number'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'coupons',
        constraint: 'coupons_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'favorites',
        constraint: 'favorites_user_id_hotel_id_key',
        columns: ['user_id', 'hotel_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'hotels',
        constraint: 'hotels_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'payments',
        constraint: 'payments_transaction_id_key',
        columns: ['transaction_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'payments',
        constraint: 'payments_provider_order_id_key',
        columns: ['provider', 'order_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'refunds',
        constraint: 'refunds_provider_id_key',
        columns: ['provider_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'reviews',
        constraint: 'reviews_booking_id_key',
        columns: ['booking_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'room_inventory',
        constraint: 'room_inventory_room_type_id_date_key',
        columns: ['room_type_id', 'date'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_clerk_id_key',
        columns: ['clerk_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_phone_key',
        columns: ['phone'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'addresses',
        index: 'addresses_city_idx_40fed80d',
        columns: ['city'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'addresses',
        index: 'addresses_country_idx_c3994778',
        columns: ['country'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'addresses',
        index: 'addresses_state_idx_ea3378ea',
        columns: ['state'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'booking_rooms',
        index: 'booking_rooms_booking_id_idx_aeea169b',
        columns: ['booking_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'booking_rooms',
        index: 'booking_rooms_room_type_id_idx_3209d37a',
        columns: ['room_type_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_coupon_id_idx_93db6295',
        columns: ['coupon_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_hotel_id_check_in_check_out_idx_46d88649',
        columns: ['hotel_id', 'check_in', 'check_out'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_hotel_id_idx_3d513303',
        columns: ['hotel_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_status_hold_expires_at_idx_57dabe91',
        columns: ['status', 'hold_expires_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'coupons',
        index: 'coupons_status_valid_from_valid_to_idx_ca5e46f0',
        columns: ['status', 'valid_from', 'valid_to'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'favorites',
        index: 'favorites_hotel_id_idx_3d513303',
        columns: ['hotel_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'favorites',
        index: 'favorites_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'hotel_amenities',
        index: 'hotel_amenities_amenity_id_idx_dffbbf85',
        columns: ['amenity_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'hotel_amenities',
        index: 'hotel_amenities_hotel_id_idx_3d513303',
        columns: ['hotel_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'hotel_images',
        index: 'hotel_images_hotel_id_idx_3d513303',
        columns: ['hotel_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'hotel_images',
        index: 'hotel_images_hotel_id_sort_order_idx_b2e89eef',
        columns: ['hotel_id', 'sort_order'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'hotels',
        index: 'hotels_owner_id_idx_ade9f347',
        columns: ['owner_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'hotels',
        index: 'hotels_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_user_id_created_at_idx_b562028f',
        columns: ['user_id', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_user_id_read_at_idx_2b723ff1',
        columns: ['user_id', 'read_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payments',
        index: 'payments_booking_id_idx_aeea169b',
        columns: ['booking_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payments',
        index: 'payments_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payments',
        index: 'payments_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'refunds',
        index: 'refunds_payment_id_idx_7931cf41',
        columns: ['payment_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'reviews',
        index: 'reviews_hotel_id_idx_3d513303',
        columns: ['hotel_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'reviews',
        index: 'reviews_hotel_id_status_idx_41df6519',
        columns: ['hotel_id', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'reviews',
        index: 'reviews_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'room_inventory',
        index: 'room_inventory_date_idx_b4ca319c',
        columns: ['date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'room_inventory',
        index: 'room_inventory_room_type_id_idx_3209d37a',
        columns: ['room_type_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'room_types',
        index: 'room_types_hotel_id_idx_3d513303',
        columns: ['hotel_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_role_idx_2c1ddf83',
        columns: ['role'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'addresses',
        foreignKey: {
          name: 'addresses_hotel_id_fkey',
          columns: ['hotel_id'],
          references: { schema: 'public', table: 'hotels', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'booking_rooms',
        foreignKey: {
          name: 'booking_rooms_booking_id_fkey',
          columns: ['booking_id'],
          references: { schema: 'public', table: 'bookings', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'booking_rooms',
        foreignKey: {
          name: 'booking_rooms_room_type_id_fkey',
          columns: ['room_type_id'],
          references: { schema: 'public', table: 'room_types', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'bookings',
        foreignKey: {
          name: 'bookings_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'bookings',
        foreignKey: {
          name: 'bookings_hotel_id_fkey',
          columns: ['hotel_id'],
          references: { schema: 'public', table: 'hotels', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'bookings',
        foreignKey: {
          name: 'bookings_coupon_id_fkey',
          columns: ['coupon_id'],
          references: { schema: 'public', table: 'coupons', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorites',
        foreignKey: {
          name: 'favorites_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorites',
        foreignKey: {
          name: 'favorites_hotel_id_fkey',
          columns: ['hotel_id'],
          references: { schema: 'public', table: 'hotels', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'hotel_amenities',
        foreignKey: {
          name: 'hotel_amenities_hotel_id_fkey',
          columns: ['hotel_id'],
          references: { schema: 'public', table: 'hotels', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'hotel_amenities',
        foreignKey: {
          name: 'hotel_amenities_amenity_id_fkey',
          columns: ['amenity_id'],
          references: { schema: 'public', table: 'amenities', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'hotel_images',
        foreignKey: {
          name: 'hotel_images_hotel_id_fkey',
          columns: ['hotel_id'],
          references: { schema: 'public', table: 'hotels', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'hotels',
        foreignKey: {
          name: 'hotels_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'notifications',
        foreignKey: {
          name: 'notifications_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'payments',
        foreignKey: {
          name: 'payments_booking_id_fkey',
          columns: ['booking_id'],
          references: { schema: 'public', table: 'bookings', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'payments',
        foreignKey: {
          name: 'payments_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'refunds',
        foreignKey: {
          name: 'refunds_payment_id_fkey',
          columns: ['payment_id'],
          references: { schema: 'public', table: 'payments', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'reviews',
        foreignKey: {
          name: 'reviews_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'reviews',
        foreignKey: {
          name: 'reviews_hotel_id_fkey',
          columns: ['hotel_id'],
          references: { schema: 'public', table: 'hotels', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'reviews',
        foreignKey: {
          name: 'reviews_booking_id_fkey',
          columns: ['booking_id'],
          references: { schema: 'public', table: 'bookings', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'room_inventory',
        foreignKey: {
          name: 'room_inventory_room_type_id_fkey',
          columns: ['room_type_id'],
          references: { schema: 'public', table: 'room_types', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'room_types',
        foreignKey: {
          name: 'room_types_hotel_id_fkey',
          columns: ['hotel_id'],
          references: { schema: 'public', table: 'hotels', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
