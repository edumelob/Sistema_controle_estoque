package com.inventory.resource;

import com.inventory.entity.Product;
import com.inventory.entity.ProductRawMaterial;
import com.inventory.entity.RawMaterial;
import com.inventory.service.ProductionCalculator;
import com.inventory.service.ProductionCalculator.MaterialNeed;
import com.inventory.service.ProductionCalculator.ProductInput;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/production")
@Produces(MediaType.APPLICATION_JSON)
@Transactional
@Tag(name = "Produção")
public class ProductionResource {

    @GET
    @Operation(summary = "Sugestão de produção",
            description = "Calcula, com o estoque atual, quanto produzir de cada produto, priorizando os de maior preço unitário.")
    public ProductionCalculator.Result suggest() {
        List<RawMaterial> rawMaterials = RawMaterial.listAll();
        Map<Long, Integer> stock = new HashMap<>();
        for (RawMaterial rm : rawMaterials) {
            stock.put(rm.id, rm.stockQuantity);
        }

        List<Product> products = Product.listAll();
        List<ProductInput> inputs = new ArrayList<>();
        for (Product p : products) {
            List<MaterialNeed> needs = new ArrayList<>();
            for (ProductRawMaterial pm : p.materials) {
                needs.add(new MaterialNeed(pm.rawMaterial.id, pm.rawMaterial.name, pm.quantityRequired));
            }
            inputs.add(new ProductInput(p.id, p.code, p.name, p.price, needs));
        }

        return ProductionCalculator.calculate(inputs, stock);
    }
}
