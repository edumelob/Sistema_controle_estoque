package com.inventory.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/** Associação entre produto e matéria-prima, com a quantidade necessária por unidade produzida. */
@Entity
@Table(
        name = "product_raw_materials",
        uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "raw_material_id"})
)
public class ProductRawMaterial extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    public RawMaterial rawMaterial;

    @Column(name = "quantity_required", nullable = false)
    public Integer quantityRequired;
}
