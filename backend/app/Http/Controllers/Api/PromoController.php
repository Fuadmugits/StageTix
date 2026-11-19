<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    /**
     * Validate promo code at checkout (Public/Customer)
     */
    public function validatePromo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $promo = Promo::where('code', strtoupper($validated['code']))
            ->where('is_active', true)
            ->first();

        if (!$promo) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode promo tidak ditemukan atau tidak aktif.'
            ], 404);
        }

        if (!$promo->isValidForAmount((float) $validated['subtotal'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode promo sudah kadaluwarsa, kuota habis, atau belum memenuhi minimal pembelian (Rp ' . number_format($promo->min_purchase, 0, ',', '.') . ').'
            ], 422);
        }

        $discountAmount = $promo->calculateDiscount((float) $validated['subtotal']);

        return response()->json([
            'status' => 'success',
            'message' => 'Kode promo berhasil digunakan!',
            'data' => [
                'code' => $promo->code,
                'type' => $promo->type,
                'value' => $promo->value,
                'discount_amount' => $discountAmount,
                'subtotal_after_discount' => max(0, $validated['subtotal'] - $discountAmount),
            ]
        ]);
    }

    /**
     * Admin: List promos
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => Promo::orderBy('created_at', 'desc')->get()
        ]);
    }

    /**
     * Admin: Create promo code
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promos,code|max:50',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:1',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'quota' => 'required|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        $promo = Promo::create([
            'code' => strtoupper($validated['code']),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_purchase' => $validated['min_purchase'] ?? 0,
            'max_discount' => $validated['max_discount'] ?? null,
            'quota' => $validated['quota'],
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Promo code created successfully.',
            'data' => $promo
        ], 201);
    }
}
