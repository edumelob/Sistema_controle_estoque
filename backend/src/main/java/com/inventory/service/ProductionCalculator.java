package com.inventory.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Regra de negócio central: calcula quanto de cada produto pode ser produzido com o estoque atual.
 *
 * <p>Estratégia (gulosa): os produtos são priorizados pelo MAIOR preço unitário. Cada produto
 * consome o estoque que precisa e o que sobra fica disponível para os próximos. Assim, uma matéria-prima
 * compartilhada por vários produtos nunca é contada duas vezes.
 *
 * <p>Classe sem dependência de framework/banco: é puro Java, por isso é fácil de testar.
 */
public final class ProductionCalculator {

    private ProductionCalculator() {
    }

    public record MaterialNeed(long rawMaterialId, String rawMaterialName, int quantityRequired) {
        public MaterialNeed {
            if (quantityRequired <= 0) {
                throw new IllegalArgumentException("A quantidade necessária deve ser maior que zero");
            }
        }
    }

    public record ProductInput(long id, String code, String name, BigDecimal price, List<MaterialNeed> needs) {
    }

    /**
     * @param limitingMaterial matéria-prima que limita a produção (o "gargalo"); {@code null} se o produto não tem composição
     */
    public record ProductionLine(long productId, String code, String name, BigDecimal unitPrice,
                                 int quantity, BigDecimal totalValue, String limitingMaterial) {
    }

    public record Result(List<ProductionLine> lines, BigDecimal totalValue) {
    }

    public static Result calculate(List<ProductInput> products, Map<Long, Integer> stock) {
        Map<Long, Integer> remaining = new HashMap<>(stock);

        List<ProductInput> ordered = new ArrayList<>(products);
        ordered.sort(Comparator.comparing(ProductInput::price).reversed().thenComparing(ProductInput::code));

        List<ProductionLine> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (ProductInput product : ordered) {
            ProductionLine line = plan(product, remaining);
            lines.add(line);
            total = total.add(line.totalValue());
        }
        return new Result(lines, total);
    }

    private static ProductionLine plan(ProductInput product, Map<Long, Integer> remaining) {
        if (product.needs().isEmpty()) {
            return new ProductionLine(product.id(), product.code(), product.name(), product.price(),
                    0, BigDecimal.ZERO, null);
        }

        int producible = Integer.MAX_VALUE;
        MaterialNeed bottleneck = null;
        for (MaterialNeed need : product.needs()) {
            int available = Math.max(remaining.getOrDefault(need.rawMaterialId(), 0), 0);
            int possible = available / need.quantityRequired();
            if (bottleneck == null || possible < producible) {
                producible = possible;
                bottleneck = need;
            }
        }

        if (producible > 0) {
            for (MaterialNeed need : product.needs()) {
                remaining.merge(need.rawMaterialId(), -(producible * need.quantityRequired()), Integer::sum);
            }
        }

        BigDecimal value = product.price().multiply(BigDecimal.valueOf(producible));
        return new ProductionLine(product.id(), product.code(), product.name(), product.price(),
                producible, value, bottleneck.rawMaterialName());
    }
}
