import { supabase } from "./supabase";
import {
  ProduceListing,
  ProduceListingFormInput,
  WorkRequest,
  WorkRequestFormInput,
  TractorBooking,
  TractorBookingFormInput,
  TransportBooking,
  TransportBookingFormInput,
  ProduceOffer,
  ProduceOfferFormInput,
  Order,
  OrderHistoryEntry,
  OrderStatus,
} from "@/types";

// ============================================================
// 1. PRODUCE LISTINGS & STORAGE
// ============================================================

export interface SupabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Uploads a crop photo to the public `produce-photos` Supabase Storage bucket.
 */
export async function uploadProducePhoto(file: File): Promise<SupabaseResult<string>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required to upload photos." };

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("produce-photos")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("produce-photos")
      .getPublicUrl(fileName);

    return { success: true, data: urlData.publicUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload photo.";
    return { success: false, error: msg };
  }
}

/**
 * Creates a new produce listing in PostgreSQL via Supabase RLS.
 */
export async function createProduceListingSupabase(
  input: ProduceListingFormInput
): Promise<SupabaseResult<ProduceListing>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const { data, error } = await supabase
      .from("produce_listings")
      .insert({
        farmer_id: user.id,
        crop: input.crop,
        quantity: input.quantity,
        unit: input.unit,
        price_per_unit: input.price,
        location: input.location,
        description: input.description || null,
        photos: input.photos || [],
        is_active: input.isActive ?? true,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const listing: ProduceListing = {
      id: data.id,
      farmerId: data.farmer_id,
      crop: data.crop,
      quantity: Number(data.quantity),
      unit: data.unit,
      price: Number(data.price_per_unit),
      location: data.location,
      description: data.description,
      photos: data.photos || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, data: listing };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create produce listing.";
    return { success: false, error: msg };
  }
}

/**
 * Fetches farmer's own produce listings from Supabase.
 */
export async function fetchOwnProduceListingsSupabase(): Promise<SupabaseResult<ProduceListing[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const { data, error } = await supabase
      .from("produce_listings")
      .select("*")
      .eq("farmer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    const listings: ProduceListing[] = (data || []).map((row) => ({
      id: row.id,
      farmerId: row.farmer_id,
      crop: row.crop,
      quantity: Number(row.quantity),
      unit: row.unit,
      price: Number(row.price_per_unit),
      location: row.location,
      description: row.description,
      photos: row.photos || [],
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { success: true, data: listings };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch produce listings.";
    return { success: false, error: msg };
  }
}

/**
 * Fetches all active produce listings for buyers.
 */
export async function fetchPublicProduceListingsSupabase(cropFilter?: string): Promise<SupabaseResult<ProduceListing[]>> {
  try {
    let query = supabase
      .from("produce_listings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (cropFilter && cropFilter.trim()) {
      query = query.ilike("crop", `%${cropFilter.trim()}%`);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };

    const listings: ProduceListing[] = (data || []).map((row) => ({
      id: row.id,
      farmerId: row.farmer_id,
      crop: row.crop,
      quantity: Number(row.quantity),
      unit: row.unit,
      price: Number(row.price_per_unit),
      location: row.location,
      description: row.description,
      photos: row.photos || [],
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { success: true, data: listings };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to search produce listings.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 2. LABOUR BOOKING & WORK REQUESTS
// ============================================================

export async function createWorkRequestSupabase(
  input: WorkRequestFormInput
): Promise<SupabaseResult<WorkRequest>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const { data, error } = await supabase
      .from("work_requests")
      .insert({
        farmer_id: user.id,
        labour_id: input.labourId,
        work_type: input.workType,
        work_date: input.workDate,
        location: input.location,
        wage: input.wage,
        message: input.message || null,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const item: WorkRequest = {
      id: data.id,
      farmerId: data.farmer_id,
      labourId: data.labour_id,
      workType: data.work_type,
      workDate: data.work_date,
      location: data.location,
      wage: Number(data.wage),
      message: data.message,
      status: data.status,
      respondedAt: data.responded_at || null,
      cancelledAt: data.cancelled_at || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
      labour: { id: data.labour_id, fullName: "Labour", labourProfile: null },
    };

    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create work request.";
    return { success: false, error: msg };
  }
}

export async function fetchWorkRequestsSupabase(asRole: "FARMER" | "LABOUR"): Promise<SupabaseResult<WorkRequest[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const filterField = asRole === "FARMER" ? "farmer_id" : "labour_id";

    const { data, error } = await supabase
      .from("work_requests")
      .select("*")
      .eq(filterField, user.id)
      .order("work_date", { ascending: true });

    if (error) return { success: false, error: error.message };

    const list: WorkRequest[] = (data || []).map((row) => ({
      id: row.id,
      farmerId: row.farmer_id,
      labourId: row.labour_id,
      workType: row.work_type,
      workDate: row.work_date,
      location: row.location,
      wage: Number(row.wage),
      message: row.message,
      status: row.status,
      respondedAt: row.responded_at || null,
      cancelledAt: row.cancelled_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      farmer: { id: row.farmer_id, fullName: "Farmer", farmerProfile: null },
      labour: { id: row.labour_id, fullName: "Labour", labourProfile: null },
    }));

    return { success: true, data: list };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch work requests.";
    return { success: false, error: msg };
  }
}

export async function respondToWorkRequestSupabase(
  id: string,
  action: "ACCEPT" | "REJECT" | "CANCEL"
): Promise<SupabaseResult<WorkRequest>> {
  try {
    const newStatus = action === "ACCEPT" ? "ACCEPTED" : action === "REJECT" ? "REJECTED" : "CANCELLED";
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (action === "CANCEL") {
      updatePayload.cancelled_at = new Date().toISOString();
    } else {
      updatePayload.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("work_requests")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        id: data.id,
        farmerId: data.farmer_id,
        labourId: data.labour_id,
        workType: data.work_type,
        workDate: data.work_date,
        location: data.location,
        wage: Number(data.wage),
        message: data.message,
        status: data.status,
        respondedAt: data.responded_at || null,
        cancelledAt: data.cancelled_at || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
        labour: { id: data.labour_id, fullName: "Labour", labourProfile: null },
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update work request.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 3. TRACTOR & EQUIPMENT BOOKINGS (With Overlap Prevention)
// ============================================================

export async function checkTractorBookingConflict(
  tractorOwnerId: string,
  bookingDate: string
): Promise<{ hasConflict: boolean; message?: string }> {
  try {
    const { data, error } = await supabase
      .from("tractor_bookings")
      .select("id, status")
      .eq("tractor_owner_id", tractorOwnerId)
      .eq("booking_date", bookingDate)
      .in("status", ["PENDING", "ACCEPTED"]);

    if (error) return { hasConflict: false };

    if (data && data.length > 0) {
      return {
        hasConflict: true,
        message: "This tractor or equipment already has a booking scheduled on this date. Please choose a different date.",
      };
    }
    return { hasConflict: false };
  } catch {
    return { hasConflict: false };
  }
}

export async function createTractorBookingSupabase(
  input: TractorBookingFormInput
): Promise<SupabaseResult<TractorBooking>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // 1. Check for booking conflicts first
    const conflictCheck = await checkTractorBookingConflict(input.tractorOwnerId, input.bookingDate);
    if (conflictCheck.hasConflict) {
      return { success: false, error: conflictCheck.message };
    }

    // 2. Insert booking
    const { data, error } = await supabase
      .from("tractor_bookings")
      .insert({
        farmer_id: user.id,
        tractor_owner_id: input.tractorOwnerId,
        work_type: input.workType,
        booking_date: input.bookingDate,
        location: input.location,
        rate_type: input.rateType,
        agreed_rate: input.rate,
        duration_units: 1,
        message: input.message || null,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const item: TractorBooking = {
      id: data.id,
      farmerId: data.farmer_id,
      tractorOwnerId: data.tractor_owner_id,
      workType: data.work_type,
      bookingDate: data.booking_date,
      location: data.location,
      rateType: data.rate_type,
      rate: Number(data.agreed_rate),
      message: data.message,
      status: data.status,
      respondedAt: data.responded_at || null,
      cancelledAt: data.cancelled_at || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
      tractorOwner: { id: data.tractor_owner_id, fullName: "Tractor Owner", tractorProfile: null },
    };

    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create tractor booking.";
    return { success: false, error: msg };
  }
}

export async function fetchTractorBookingsSupabase(asRole: "FARMER" | "TRACTOR_OWNER"): Promise<SupabaseResult<TractorBooking[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const filterField = asRole === "FARMER" ? "farmer_id" : "tractor_owner_id";

    const { data, error } = await supabase
      .from("tractor_bookings")
      .select("*")
      .eq(filterField, user.id)
      .order("booking_date", { ascending: true });

    if (error) return { success: false, error: error.message };

    const list: TractorBooking[] = (data || []).map((row) => ({
      id: row.id,
      farmerId: row.farmer_id,
      tractorOwnerId: row.tractor_owner_id,
      workType: row.work_type,
      bookingDate: row.booking_date,
      location: row.location,
      rateType: row.rate_type,
      rate: Number(row.agreed_rate),
      message: row.message,
      status: row.status,
      respondedAt: row.responded_at || null,
      cancelledAt: row.cancelled_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      farmer: { id: row.farmer_id, fullName: "Farmer", farmerProfile: null },
      tractorOwner: { id: row.tractor_owner_id, fullName: "Tractor Owner", tractorProfile: null },
    }));

    return { success: true, data: list };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch tractor bookings.";
    return { success: false, error: msg };
  }
}

export async function respondToTractorBookingSupabase(
  id: string,
  action: "ACCEPT" | "REJECT" | "CANCEL"
): Promise<SupabaseResult<TractorBooking>> {
  try {
    const newStatus = action === "ACCEPT" ? "ACCEPTED" : action === "REJECT" ? "REJECTED" : "CANCELLED";
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (action === "CANCEL") {
      updatePayload.cancelled_at = new Date().toISOString();
    } else {
      updatePayload.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("tractor_bookings")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        id: data.id,
        farmerId: data.farmer_id,
        tractorOwnerId: data.tractor_owner_id,
        workType: data.work_type,
        bookingDate: data.booking_date,
        location: data.location,
        rateType: data.rate_type,
        rate: Number(data.agreed_rate),
        message: data.message,
        status: data.status,
        respondedAt: data.responded_at || null,
        cancelledAt: data.cancelled_at || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
        tractorOwner: { id: data.tractor_owner_id, fullName: "Tractor Owner", tractorProfile: null },
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update tractor booking.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 4. TRANSPORT JOBS & DELIVERIES (With OTP & Proof)
// ============================================================

export async function createTransportBookingSupabase(
  input: TransportBookingFormInput
): Promise<SupabaseResult<TransportBooking>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    // Generate 6-digit Delivery OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase
      .from("transport_bookings")
      .insert({
        farmer_id: user.id,
        transport_provider_id: input.transportProviderId,
        goods_type: input.goodsType,
        pickup_location: input.pickupLocation,
        drop_location: input.dropLocation,
        booking_date: input.bookingDate,
        rate_type: input.rateType,
        agreed_rate: input.rate,
        message: input.message || null,
        delivery_otp_hash: rawOtp,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const item: TransportBooking = {
      id: data.id,
      farmerId: data.farmer_id,
      transportProviderId: data.transport_provider_id,
      goodsType: data.goods_type,
      pickupLocation: data.pickup_location,
      dropLocation: data.drop_location,
      bookingDate: data.booking_date,
      rateType: data.rate_type,
      rate: Number(data.agreed_rate),
      message: data.message,
      status: data.status,
      respondedAt: data.responded_at || null,
      cancelledAt: data.cancelled_at || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
      transportProvider: { id: data.transport_provider_id, fullName: "Transporter", transportProfile: null },
    };

    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create transport booking.";
    return { success: false, error: msg };
  }
}

export async function fetchTransportBookingsSupabase(asRole: "FARMER" | "TRANSPORT_PROVIDER"): Promise<SupabaseResult<TransportBooking[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const filterField = asRole === "FARMER" ? "farmer_id" : "transport_provider_id";

    const { data, error } = await supabase
      .from("transport_bookings")
      .select("*")
      .eq(filterField, user.id)
      .order("booking_date", { ascending: true });

    if (error) return { success: false, error: error.message };

    const list: TransportBooking[] = (data || []).map((row) => ({
      id: row.id,
      farmerId: row.farmer_id,
      transportProviderId: row.transport_provider_id,
      goodsType: row.goods_type,
      pickupLocation: row.pickup_location,
      dropLocation: row.drop_location,
      bookingDate: row.booking_date,
      rateType: row.rate_type,
      rate: Number(row.agreed_rate),
      message: row.message,
      status: row.status,
      respondedAt: row.responded_at || null,
      cancelledAt: row.cancelled_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      farmer: { id: row.farmer_id, fullName: "Farmer", farmerProfile: null },
      transportProvider: { id: row.transport_provider_id, fullName: "Transporter", transportProfile: null },
    }));

    return { success: true, data: list };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch transport bookings.";
    return { success: false, error: msg };
  }
}

export async function respondToTransportBookingSupabase(
  id: string,
  action: "ACCEPT" | "REJECT" | "CANCEL"
): Promise<SupabaseResult<TransportBooking>> {
  try {
    const newStatus = action === "ACCEPT" ? "ACCEPTED" : action === "REJECT" ? "REJECTED" : "CANCELLED";
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (action === "CANCEL") {
      updatePayload.cancelled_at = new Date().toISOString();
    } else {
      updatePayload.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("transport_bookings")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        id: data.id,
        farmerId: data.farmer_id,
        transportProviderId: data.transport_provider_id,
        goodsType: data.goods_type,
        pickupLocation: data.pickup_location,
        dropLocation: data.drop_location,
        bookingDate: data.booking_date,
        rateType: data.rate_type,
        rate: Number(data.agreed_rate),
        message: data.message,
        status: data.status,
        respondedAt: data.responded_at || null,
        cancelledAt: data.cancelled_at || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
        transportProvider: { id: data.transport_provider_id, fullName: "Transporter", transportProfile: null },
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update transport booking.";
    return { success: false, error: msg };
  }
}

export async function confirmTransportDeliveryOtpSupabase(
  bookingId: string,
  enteredOtp: string
): Promise<SupabaseResult<boolean>> {
  try {
    const { data, error } = await supabase
      .from("transport_bookings")
      .select("delivery_otp_hash, status")
      .eq("id", bookingId)
      .single();

    if (error || !data) return { success: false, error: "Booking record not found." };

    if (data.delivery_otp_hash !== enteredOtp.trim()) {
      return { success: false, error: "Invalid delivery OTP. Please verify with the farmer." };
    }

    const { error: updateError } = await supabase
      .from("transport_bookings")
      .update({
        status: "COMPLETED",
        delivery_otp_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) return { success: false, error: updateError.message };

    return { success: true, data: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to confirm delivery OTP.";
    return { success: false, error: msg };
  }
}

// ============================================================
// 5. BUYER OFFERS & PURCHASE ORDERS
// ============================================================

export async function createProduceOfferSupabase(
  input: ProduceOfferFormInput
): Promise<SupabaseResult<ProduceOffer>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const { data: listing, error: listingErr } = await supabase
      .from("produce_listings")
      .select("farmer_id, crop, unit, price_per_unit")
      .eq("id", input.listingId)
      .single();

    if (listingErr || !listing) return { success: false, error: "Listing not found." };

    const { data, error } = await supabase
      .from("produce_offers")
      .insert({
        listing_id: input.listingId,
        buyer_id: user.id,
        farmer_id: listing.farmer_id,
        offer_price: input.offerPrice,
        quantity: input.quantity,
        message: input.message || null,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const item: ProduceOffer = {
      id: data.id,
      listingId: data.listing_id,
      buyerId: data.buyer_id,
      farmerId: data.farmer_id,
      offerPrice: Number(data.offer_price),
      quantity: Number(data.quantity),
      message: data.message,
      status: data.status,
      respondedAt: data.responded_at || null,
      withdrawnAt: data.withdrawn_at || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      listing: {
        id: data.listing_id,
        crop: listing.crop,
        quantity: Number(data.quantity),
        unit: listing.unit,
        price: Number(listing.price_per_unit),
        location: "Maharashtra",
        isActive: true,
      },
      buyer: { id: data.buyer_id, fullName: "Buyer", email: "buyer@sathi.in" },
      farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
    };

    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit offer.";
    return { success: false, error: msg };
  }
}

export async function fetchOffersSupabase(asRole: "BUYER" | "FARMER"): Promise<SupabaseResult<ProduceOffer[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const filterField = asRole === "BUYER" ? "buyer_id" : "farmer_id";

    const { data, error } = await supabase
      .from("produce_offers")
      .select("*")
      .eq(filterField, user.id)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    const list: ProduceOffer[] = (data || []).map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      buyerId: row.buyer_id,
      farmerId: row.farmer_id,
      offerPrice: Number(row.offer_price),
      quantity: Number(row.quantity),
      message: row.message,
      status: row.status,
      respondedAt: row.responded_at || null,
      withdrawnAt: row.withdrawn_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      listing: {
        id: row.listing_id,
        crop: "Agricultural Produce",
        quantity: Number(row.quantity),
        unit: "QUINTAL",
        price: Number(row.offer_price),
        location: "Maharashtra",
        isActive: true,
      },
      buyer: { id: row.buyer_id, fullName: "Buyer", email: "buyer@sathi.in" },
      farmer: { id: row.farmer_id, fullName: "Farmer", farmerProfile: null },
    }));

    return { success: true, data: list };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch offers.";
    return { success: false, error: msg };
  }
}

export async function respondToProduceOfferSupabase(
  offerId: string,
  action: "ACCEPT" | "REJECT"
): Promise<SupabaseResult<{ offer: ProduceOffer; order?: Order }>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const newStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    // 1. Update the offer
    const { data: offerData, error: offerError } = await supabase
      .from("produce_offers")
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .eq("farmer_id", user.id)
      .select()
      .single();

    if (offerError || !offerData) return { success: false, error: "Failed to update offer." };

    const offer: ProduceOffer = {
      id: offerData.id,
      listingId: offerData.listing_id,
      buyerId: offerData.buyer_id,
      farmerId: offerData.farmer_id,
      offerPrice: Number(offerData.offer_price),
      quantity: Number(offerData.quantity),
      message: offerData.message,
      status: offerData.status,
      respondedAt: offerData.responded_at || null,
      withdrawnAt: offerData.withdrawn_at || null,
      createdAt: offerData.created_at,
      updatedAt: offerData.updated_at,
      listing: {
        id: offerData.listing_id,
        crop: "Agricultural Produce",
        quantity: Number(offerData.quantity),
        unit: "QUINTAL",
        price: Number(offerData.offer_price),
        location: "Maharashtra",
        isActive: true,
      },
      buyer: { id: offerData.buyer_id, fullName: "Buyer", email: "buyer@sathi.in" },
      farmer: { id: offerData.farmer_id, fullName: "Farmer", farmerProfile: null },
    };

    // If accepted, auto-create purchase order
    if (action === "ACCEPT") {
      const { data: listing } = await supabase
        .from("produce_listings")
        .select("crop, unit")
        .eq("id", offerData.listing_id)
        .single();

      const totalAmount = Number(offerData.offer_price) * Number(offerData.quantity);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          offer_id: offerData.id,
          listing_id: offerData.listing_id,
          buyer_id: offerData.buyer_id,
          farmer_id: offerData.farmer_id,
          crop: listing?.crop || "Agricultural Produce",
          quantity: offerData.quantity,
          unit: listing?.unit || "QUINTAL",
          price_per_unit: offerData.offer_price,
          total_amount: totalAmount,
          status: "CONFIRMED",
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!orderError && orderData) {
        // Record initial status in history
        await supabase.from("order_status_history").insert({
          order_id: orderData.id,
          status: "CONFIRMED",
          note: "Offer accepted by farmer. Purchase order confirmed.",
          changed_by_id: user.id,
        });

        const order: Order = {
          id: orderData.id,
          offerId: orderData.offer_id,
          listingId: orderData.listing_id,
          buyerId: orderData.buyer_id,
          farmerId: orderData.farmer_id,
          crop: orderData.crop,
          quantity: Number(orderData.quantity),
          unit: orderData.unit,
          pricePerUnit: Number(orderData.price_per_unit),
          totalAmount: Number(orderData.total_amount),
          status: orderData.status,
          confirmedAt: orderData.confirmed_at || null,
          readyAt: orderData.ready_at || null,
          pickedUpAt: orderData.picked_up_at || null,
          deliveredAt: orderData.delivered_at || null,
          completedAt: orderData.completed_at || null,
          cancelledAt: orderData.cancelled_at || null,
          cancellationReason: orderData.cancellation_reason || null,
          createdAt: orderData.created_at,
          updatedAt: orderData.updated_at,
          listing: {
            id: orderData.listing_id,
            location: "Maharashtra",
            photos: [],
          },
          buyer: { id: orderData.buyer_id, fullName: "Buyer", email: "buyer@sathi.in" },
          farmer: { id: orderData.farmer_id, fullName: "Farmer", farmerProfile: null },
        };

        return { success: true, data: { offer, order } };
      }
    }

    return { success: true, data: { offer } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process offer response.";
    return { success: false, error: msg };
  }
}

export async function advanceOrderStatusSupabase(
  orderId: string,
  nextStatus: OrderStatus,
  note?: string
): Promise<SupabaseResult<Order>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Authentication required." };

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
      updated_at: now,
    };

    if (nextStatus === "READY") updatePayload.ready_at = now;
    if (nextStatus === "PICKUP") updatePayload.picked_up_at = now;
    if (nextStatus === "DELIVERED") updatePayload.delivered_at = now;
    if (nextStatus === "COMPLETED") updatePayload.completed_at = now;

    const { data, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: nextStatus,
      note: note || `Order advanced to ${nextStatus}`,
      changed_by_id: user.id,
    });

    const order: Order = {
      id: data.id,
      offerId: data.offer_id,
      listingId: data.listing_id,
      buyerId: data.buyer_id,
      farmerId: data.farmer_id,
      crop: data.crop,
      quantity: Number(data.quantity),
      unit: data.unit,
      pricePerUnit: Number(data.price_per_unit),
      totalAmount: Number(data.total_amount),
      status: data.status,
      confirmedAt: data.confirmed_at || null,
      readyAt: data.ready_at || null,
      pickedUpAt: data.picked_up_at || null,
      deliveredAt: data.delivered_at || null,
      completedAt: data.completed_at || null,
      cancelledAt: data.cancelled_at || null,
      cancellationReason: data.cancellation_reason || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      listing: {
        id: data.listing_id,
        location: "Maharashtra",
        photos: [],
      },
      buyer: { id: data.buyer_id, fullName: "Buyer", email: "buyer@sathi.in" },
      farmer: { id: data.farmer_id, fullName: "Farmer", farmerProfile: null },
    };

    return { success: true, data: order };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to advance order status.";
    return { success: false, error: msg };
  }
}

export async function fetchOrderHistorySupabase(orderId: string): Promise<SupabaseResult<OrderHistoryEntry[]>> {
  try {
    const { data, error } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) return { success: false, error: error.message };

    const history: OrderHistoryEntry[] = (data || []).map((row) => ({
      id: row.id,
      status: row.status,
      note: row.note,
      createdAt: row.created_at,
      changedBy: {
        id: row.changed_by_id,
        fullName: "System User",
        role: "USER",
      },
    }));

    return { success: true, data: history };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch order history.";
    return { success: false, error: msg };
  }
}
