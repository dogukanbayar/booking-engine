package com.bookingengine.backend.dto.request;

import com.bookingengine.backend.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotNull(message = "Statü bilgisi zorunludur.")
    private AppointmentStatus status;
}
