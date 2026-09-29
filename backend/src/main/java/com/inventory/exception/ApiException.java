package com.inventory.exception;

/** Erro de negócio com status HTTP associado (404, 409, 400...). */
public class ApiException extends RuntimeException {

    private final int status;

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
