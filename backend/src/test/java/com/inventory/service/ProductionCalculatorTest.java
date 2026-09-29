package com.inventory.service;

import com.inventory.service.ProductionCalculator.MaterialNeed;
import com.inventory.service.ProductionCalculator.ProductInput;
import com.inventory.service.ProductionCalculator.ProductionLine;
import com.inventory.service.ProductionCalculator.Result;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductionCalculatorTest {

    private static final long A = 1L;
    private static final long B = 2L;

    private static ProductInput product(long id, String code, String price, MaterialNeed... needs) {
        return new ProductInput(id, code, "Produto " + code, new BigDecimal(price), List.of(needs));
    }

    private static MaterialNeed need(long materialId, String name, int qty) {
        return new MaterialNeed(materialId, name, qty);
    }

    private static void assertMoney(String expected, BigDecimal actual) {
        assertEquals(0, new BigDecimal(expected).compareTo(actual), "esperado " + expected + " mas foi " + actual);
    }

    @Test
    void limitedByTheScarcestMaterial() {
        // 2 de A + 1 de B por unidade. Estoque: A=10 (=> 5 un.), B=6 (=> 6 un.). Gargalo: A.
        Result result = ProductionCalculator.calculate(
                List.of(product(1, "X", "100.00", need(A, "A", 2), need(B, "B", 1))),
                Map.of(A, 10, B, 6));

        ProductionLine line = result.lines().get(0);
        assertEquals(5, line.quantity());
        assertEquals("A", line.limitingMaterial());
        assertMoney("500", result.totalValue());
    }

    @Test
    void sharedMaterialGoesToTheMostValuableProductFirst() {
        // P1 (R$100) usa 3 de A; P2 (R$40) usa 1 de A e 1 de B. Estoque: A=10, B=5.
        // P1 => 3 un. (consome 9 de A). Sobra 1 de A para P2 => 1 un. Total = 300 + 40.
        Result result = ProductionCalculator.calculate(
                List.of(
                        product(2, "P2", "40.00", need(A, "A", 1), need(B, "B", 1)),
                        product(1, "P1", "100.00", need(A, "A", 3))),
                Map.of(A, 10, B, 5));

        assertEquals("P1", result.lines().get(0).code());
        assertEquals(3, result.lines().get(0).quantity());
        assertEquals("P2", result.lines().get(1).code());
        assertEquals(1, result.lines().get(1).quantity());
        assertMoney("340", result.totalValue());
    }

    @Test
    void productWithoutCompositionIsNotProduced() {
        Result result = ProductionCalculator.calculate(
                List.of(product(1, "X", "10.00")),
                Map.of(A, 100));

        ProductionLine line = result.lines().get(0);
        assertEquals(0, line.quantity());
        assertNull(line.limitingMaterial());
        assertMoney("0", result.totalValue());
    }

    @Test
    void missingStockCountsAsZero() {
        Result result = ProductionCalculator.calculate(
                List.of(product(1, "X", "10.00", need(A, "A", 1))),
                Map.of());

        assertEquals(0, result.lines().get(0).quantity());
        assertEquals("A", result.lines().get(0).limitingMaterial());
    }

    @Test
    void doesNotChangeTheStockMapReceived() {
        Map<Long, Integer> stock = new java.util.HashMap<>(Map.of(A, 10));
        ProductionCalculator.calculate(List.of(product(1, "X", "10.00", need(A, "A", 2))), stock);
        assertEquals(10, stock.get(A));
    }

    @Test
    void rejectsNonPositiveQuantities() {
        assertThrows(IllegalArgumentException.class, () -> need(A, "A", 0));
    }
}
