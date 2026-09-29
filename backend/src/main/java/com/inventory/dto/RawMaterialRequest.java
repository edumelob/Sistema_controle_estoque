package com.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RawMaterialRequest {

    @NotBlank(message = "O código da matéria-prima é obrigatório")
    @Size(max = 50, message = "O código deve ter no máximo 50 caracteres")
    public String code;

    @NotBlank(message = "O nome da matéria-prima é obrigatório")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
    public String name;

    @NotNull(message = "A quantidade em estoque é obrigatória")
    @Min(value = 0, message = "A quantidade em estoque não pode ser negativa")
    public Integer stockQuantity;
}
