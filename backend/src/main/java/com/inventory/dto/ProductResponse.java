package com.inventory.dto;

import com.inventory.entity.Product;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

public record ProductResponse(Long id, String code, String name, BigDecimal price,
                              List<MaterialLineResponse> materials) {

    public record MaterialLineResponse(Long rawMaterialId, String rawMaterialCode,
                                       String rawMaterialName, Integer quantityRequired) {
    }

    public static ProductResponse from(Product product) {
        List<MaterialLineResponse> lines = product.materials.stream()
                .map(pm -> new MaterialLineResponse(
                        pm.rawMaterial.id, pm.rawMaterial.code, pm.rawMaterial.name, pm.quantityRequired))
                .sorted(Comparator.comparing(MaterialLineResponse::rawMaterialName))
                .toList();
        return new ProductResponse(product.id, product.code, product.name, product.price, lines);
    }
}
