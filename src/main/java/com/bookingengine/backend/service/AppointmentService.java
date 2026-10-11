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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SpecialistRepository specialistRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        Specialist specialist = specialistRepository.findById(request.getSpecialistId())
                .orElseThrow(() -> new ResourceNotFoundException("Uzman bulunamadı. ID: " + request.getSpecialistId()));

        // Double Booking Önleme: Uygulama seviyesi kontrolü
        boolean isSlotTaken = appointmentRepository.existsActiveSlot(
                request.getSpecialistId(),
                request.getAppointmentDate(),
                request.getStartTime()
        );

        if (isSlotTaken) {
            throw new SlotAlreadyBookedException("Seçilen tarih ve saat dilimi (" + 
                    request.getAppointmentDate() + " " + request.getStartTime() + ") doludur.");
        }

        // Müşteri bul veya ilk kez geliyorsa kaydet
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

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Randevu bulunamadı. ID: " + id));
        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointments(LocalDate date, Long specialistId) {
        List<Appointment> list;
        if (specialistId != null) {
            list = appointmentRepository.findBySpecialistIdAndAppointmentDateOrderByStartTimeAsc(specialistId, date);
        } else {
            list = appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(date);
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, UpdateStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Randevu bulunamadı. ID: " + id));
        appointment.setStatus(request.getStatus());
        return mapToResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse mapToResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .specialistId(a.getSpecialist().getId())
                .specialistFullName(a.getSpecialist().getFirstName() + " " + a.getSpecialist().getLastName())
                .specialistTitle(a.getSpecialist().getTitle())
                .customerFullName(a.getCustomer().getFirstName() + " " + a.getCustomer().getLastName())
                .customerEmail(a.getCustomer().getEmail())
                .customerPhone(a.getCustomer().getPhone())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .notes(a.getNotes())
                .build();
    }
}
