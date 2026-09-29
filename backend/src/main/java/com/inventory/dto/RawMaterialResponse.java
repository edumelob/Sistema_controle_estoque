package com.inventory.dto;

import com.inventory.entity.RawMaterial;

public record RawMaterialResponse(Long id, String code, String name, int stockQuantity) {

    public static RawMaterialResponse from(RawMaterial rm) {
        return new RawMaterialResponse(rm.id, rm.code, rm.name, rm.stockQuantity);
    }
}
