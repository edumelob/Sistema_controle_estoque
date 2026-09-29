package com.inventory.resource;

import com.inventory.dto.ProductRequest;
import com.inventory.dto.ProductResponse;
import com.inventory.entity.Product;
import com.inventory.entity.ProductRawMaterial;
import com.inventory.entity.RawMaterial;
import com.inventory.exception.ApiException;
import io.quarkus.panache.common.Sort;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Transactional
@Tag(name = "Produtos")
public class ProductResource {

    @GET
    public List<ProductResponse> list() {
        List<Product> all = Product.listAll(Sort.by("name"));
        return all.stream().map(ProductResponse::from).toList();
    }

    @GET
    @Path("/{id}")
    public ProductResponse get(@PathParam("id") Long id) {
        return ProductResponse.from(findOrFail(id));
    }

    @POST
    public Response create(@Valid ProductRequest request) {
        String code = request.code.trim();
        if (Product.count("code", code) > 0) {
            throw new ApiException(409, "Já existe um produto com o código '" + code + "'");
        }
        Product product = new Product();
        product.code = code;
        product.name = request.name.trim();
        product.price = request.price;
        applyMaterials(product, request.materials);
        product.persist();
        return Response.status(Response.Status.CREATED).entity(ProductResponse.from(product)).build();
    }

    @PUT
    @Path("/{id}")
    public ProductResponse update(@PathParam("id") Long id, @Valid ProductRequest request) {
        Product product = findOrFail(id);
        String code = request.code.trim();
        if (Product.count("code = ?1 and id <> ?2", code, id) > 0) {
            throw new ApiException(409, "Já existe um produto com o código '" + code + "'");
        }
        product.code = code;
        product.name = request.name.trim();
        product.price = request.price;
        applyMaterials(product, request.materials);
        return ProductResponse.from(product);
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {
        findOrFail(id).delete();
    }

    private Product findOrFail(Long id) {
        Product product = Product.findById(id);
        if (product == null) {
            throw new ApiException(404, "Produto não encontrado");
        }
        return product;
    }

    /**
     * Sincroniza a composição do produto com a lista recebida: atualiza linhas existentes,
     * cria as novas e remove as que saíram. (Atualizar "no lugar" evita violar a constraint
     * única produto+matéria-prima, o que aconteceria se apagássemos e recriássemos as linhas.)
     */
    private void applyMaterials(Product product, List<ProductRequest.MaterialLine> lines) {
        Map<Long, ProductRawMaterial> current = new HashMap<>();
        for (ProductRawMaterial pm : product.materials) {
            current.put(pm.rawMaterial.id, pm);
        }

        Set<Long> requested = new HashSet<>();
        for (ProductRequest.MaterialLine line : lines) {
            if (!requested.add(line.rawMaterialId)) {
                throw new ApiException(400, "A mesma matéria-prima foi informada mais de uma vez na composição");
            }
            ProductRawMaterial pm = current.get(line.rawMaterialId);
            if (pm == null) {
                RawMaterial rm = RawMaterial.findById(line.rawMaterialId);
                if (rm == null) {
                    throw new ApiException(400, "Matéria-prima não encontrada (id " + line.rawMaterialId + ")");
                }
                pm = new ProductRawMaterial();
                pm.product = product;
                pm.rawMaterial = rm;
                product.materials.add(pm);
            }
            pm.quantityRequired = line.quantityRequired;
        }

        product.materials.removeIf(pm -> !requested.contains(pm.rawMaterial.id));
    }
}
