package com.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class ProductRequest {

    @NotBlank(message = "O código do produto é obrigatório")
    @Size(max = 50, message = "O código deve ter no máximo 50 caracteres")
    public String code;

    @NotBlank(message = "O nome do produto é obrigatório")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
    public String name;

    @NotNull(message = "O preço é obrigatório")
    @Positive(message = "O preço deve ser maior que zero")
    @Digits(integer = 10, fraction = 2, message = "O preço deve ter no máximo 2 casas decimais")
    public BigDecimal price;

    @NotNull(message = "Informe a composição do produto (pode ser uma lista vazia)")
    @Valid
    public List<MaterialLine> materials;

    public static class MaterialLine {

        @NotNull(message = "Selecione a matéria-prima")
        public Long rawMaterialId;

        @NotNull(message = "Informe a quantidade necessária")
        @Min(value = 1, message = "A quantidade necessária deve ser de pelo menos 1")
        public Integer quantityRequired;
    }
}
