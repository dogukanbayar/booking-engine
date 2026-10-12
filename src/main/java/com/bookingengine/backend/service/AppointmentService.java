package com.bookingengine.backend.service;

import com.bookingengine.backend.dto.request.CreateAppointmentRequest;
import com.bookingengine.backend.dto.request.UpdateStatusRequest;
import com.bookingengine.backend.dto.response.AppointmentResponse;
import com.bookingengine.backend.entity.Appointment;
import com.bookingengine.backend.entity.Customer;
import com.bookingengine.backend.entity.Specialist;
import com.bookingengine.backend.enums.AppointmentStatus;
import com.bookingengine.backend.exception.ResourceNotFoundException;
import com.bookingengine.backend.exception.SlotAlreadyBookedException;
import com.bookingengine.backend.repository.AppointmentRepository;
import com.bookingengine.backend.repository.CustomerRepository;
import com.bookingengine.backend.repository.SpecialistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SpecialistRepository specialistRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        log.info("Randevu talebi isleniyor: Specialist ID={}, Date={}, Time={}", 
                request.getSpecialistId(), request.getAppointmentDate(), request.getStartTime());

        Specialist specialist = specialistRepository.findById(request.getSpecialistId())
                .orElseThrow(() -> {
                    log.warn("Uzman bulunamadi: ID={}", request.getSpecialistId());
                    return new ResourceNotFoundException("Uzman bulunamadı.");
                });

        boolean isBooked = appointmentRepository.existsActiveSlot(
                request.getSpecialistId(),
                request.getAppointmentDate(),
                request.getStartTime()
        );

        if (isBooked) {
            log.warn("Slot cakismasi engellendi (Pre-check): Specialist ID={}, Date={}, Time={}", 
                    request.getSpecialistId(), request.getAppointmentDate(), request.getStartTime());
            throw new SlotAlreadyBookedException("Seçilen tarih ve saat dilimi için randevu doludur.");
        }

        Customer customer = customerRepository.findByEmail(request.getCustomerEmail())
                .orElseGet(() -> customerRepository.save(
                        Customer.builder()
                                .firstName(request.getCustomerFirstName())
                                .lastName(request.getCustomerLastName())
                                .email(request.getCustomerEmail())
                                .phone(request.getCustomerPhone())
                                .build()
                ));

        LocalTime endTime = request.getStartTime().plusMinutes(30);

        Appointment appointment = Appointment.builder()
                .specialist(specialist)
                .customer(customer)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        try {
            Appointment saved = appointmentRepository.saveAndFlush(appointment);
            log.info("Randevu basariyla olusturuldu: ID={}, Customer={}", saved.getId(), customer.getEmail());
            return mapToResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            log.error("Eszamanli cakisma yakalandi (Database constraint): {}", ex.getMessage());
            throw new SlotAlreadyBookedException("Seçilen randevu aralığı az önce başka bir kullanıcı tarafından rezerve edildi.");
        }
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Randevu bulunamadı: " + id));
        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointments(LocalDate date, Long specialistId) {
        List<Appointment> appointments;
        if (specialistId != null) {
            appointments = appointmentRepository.findByAppointmentDateAndSpecialistId(date, specialistId);
        } else {
            appointments = appointmentRepository.findByAppointmentDate(date);
        }
        return appointments.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, UpdateStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Randevu kaydı bulunamadı: " + id));

        log.info("Randevu durumu guncelleniyor: ID={}, Eski Durum={}, Yeni Durum={}", 
                id, appointment.getStatus(), request.getStatus());

        appointment.setStatus(request.getStatus());
        return mapToResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse mapToResponse(Appointment entity) {
        return AppointmentResponse.builder()
                .id(entity.getId())
                .specialistId(entity.getSpecialist().getId())
                .specialistFullName(entity.getSpecialist().getFirstName() + " " + entity.getSpecialist().getLastName())
                .specialistTitle(entity.getSpecialist().getTitle())
                .customerFullName(entity.getCustomer().getFirstName() + " " + entity.getCustomer().getLastName())
                .customerEmail(entity.getCustomer().getEmail())
                .customerPhone(entity.getCustomer().getPhone())
                .appointmentDate(entity.getAppointmentDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
