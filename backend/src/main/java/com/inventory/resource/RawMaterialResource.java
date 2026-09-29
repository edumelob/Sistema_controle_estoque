package com.inventory.resource;

import com.inventory.dto.RawMaterialRequest;
import com.inventory.dto.RawMaterialResponse;
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

import java.util.List;

@Path("/api/raw-materials")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Transactional
@Tag(name = "Matérias-primas")
public class RawMaterialResource {

    @GET
    public List<RawMaterialResponse> list() {
        List<RawMaterial> all = RawMaterial.listAll(Sort.by("name"));
        return all.stream().map(RawMaterialResponse::from).toList();
    }

    @GET
    @Path("/{id}")
    public RawMaterialResponse get(@PathParam("id") Long id) {
        return RawMaterialResponse.from(findOrFail(id));
    }

    @POST
    public Response create(@Valid RawMaterialRequest request) {
        String code = request.code.trim();
        if (RawMaterial.count("code", code) > 0) {
            throw new ApiException(409, "Já existe uma matéria-prima com o código '" + code + "'");
        }
        RawMaterial rm = new RawMaterial();
        rm.code = code;
        rm.name = request.name.trim();
        rm.stockQuantity = request.stockQuantity;
        rm.persist();
        return Response.status(Response.Status.CREATED).entity(RawMaterialResponse.from(rm)).build();
    }

    @PUT
    @Path("/{id}")
    public RawMaterialResponse update(@PathParam("id") Long id, @Valid RawMaterialRequest request) {
        RawMaterial rm = findOrFail(id);
        String code = request.code.trim();
        if (RawMaterial.count("code = ?1 and id <> ?2", code, id) > 0) {
            throw new ApiException(409, "Já existe uma matéria-prima com o código '" + code + "'");
        }
        rm.code = code;
        rm.name = request.name.trim();
        rm.stockQuantity = request.stockQuantity;
        return RawMaterialResponse.from(rm);
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {
        RawMaterial rm = findOrFail(id);
        long usedBy = ProductRawMaterial.count("rawMaterial.id = ?1", id);
        if (usedBy > 0) {
            throw new ApiException(409, "Não é possível excluir: a matéria-prima é usada por "
                    + usedBy + " produto(s). Remova-a da composição primeiro.");
        }
        rm.delete();
    }

    private RawMaterial findOrFail(Long id) {
        RawMaterial rm = RawMaterial.findById(id);
        if (rm == null) {
            throw new ApiException(404, "Matéria-prima não encontrada");
        }
        return rm;
    }
}
