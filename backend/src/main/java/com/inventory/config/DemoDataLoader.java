package com.inventory.config;

import com.inventory.entity.Product;
import com.inventory.entity.ProductRawMaterial;
import com.inventory.entity.RawMaterial;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.math.BigDecimal;

/** Insere dados de exemplo (uma marcenaria) na primeira execução, para a demo já abrir com conteúdo. */
@ApplicationScoped
public class DemoDataLoader {

    @ConfigProperty(name = "app.seed-demo-data", defaultValue = "true")
    boolean seed;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (!seed || Product.count() > 0 || RawMaterial.count() > 0) {
            return;
        }

        RawMaterial mdf = rawMaterial("MP-001", "Chapa de MDF", 60);
        RawMaterial parafuso = rawMaterial("MP-002", "Parafuso", 300);
        RawMaterial cola = rawMaterial("MP-003", "Cola de madeira (frasco)", 20);
        RawMaterial tinta = rawMaterial("MP-004", "Tinta (lata)", 15);
        RawMaterial dobradica = rawMaterial("MP-005", "Dobradiça", 24);

        Product armario = product("PR-001", "Armário", "780.00");
        link(armario, mdf, 6);
        link(armario, parafuso, 20);
        link(armario, dobradica, 4);
        link(armario, tinta, 1);

        Product mesa = product("PR-002", "Mesa de jantar", "420.00");
        link(mesa, mdf, 4);
        link(mesa, parafuso, 16);
        link(mesa, cola, 1);
        link(mesa, tinta, 2);

        Product estante = product("PR-003", "Estante", "250.00");
        link(estante, mdf, 3);
        link(estante, parafuso, 12);
        link(estante, cola, 1);

        Product banco = product("PR-004", "Banco", "90.00");
        link(banco, mdf, 1);
        link(banco, parafuso, 4);
        link(banco, cola, 1);
    }

    private RawMaterial rawMaterial(String code, String name, int stock) {
        RawMaterial rm = new RawMaterial();
        rm.code = code;
        rm.name = name;
        rm.stockQuantity = stock;
        rm.persist();
        return rm;
    }

    private Product product(String code, String name, String price) {
        Product p = new Product();
        p.code = code;
        p.name = name;
        p.price = new BigDecimal(price);
        p.persist();
        return p;
    }

    private void link(Product product, RawMaterial rawMaterial, int quantity) {
        ProductRawMaterial pm = new ProductRawMaterial();
        pm.product = product;
        pm.rawMaterial = rawMaterial;
        pm.quantityRequired = quantity;
        product.materials.add(pm);
        pm.persist();
    }
}
