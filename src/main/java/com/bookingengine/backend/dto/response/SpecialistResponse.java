package com.bookingengine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpecialistResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String title;
    private String email;
}
