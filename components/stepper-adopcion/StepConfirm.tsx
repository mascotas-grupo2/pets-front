import { AdoptForm } from "@/types/adoptar";


const StepConfirm = ({ values }: { values: AdoptForm }) => {
  return (
    <>
      <h2 className="wizard-heading">Revisá y confirmá</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
        Si todo está bien, enviá tu solicitud y nos pondremos en contacto.
      </p>
      <dl className="wizard-review">
        <div>
          <dt>Nombre</dt>
          <dd>
            {values.firstName} {values.lastName}
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{values.email}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{values.phone}</dd>
        </div>
        <div>
          <dt>Mascota preferida</dt>
          <dd>{values.preferredAnimal || "—"}</dd>
        </div>
        <div>
          <dt>Dirección</dt>
          <dd>
            {values.addressLine1}
            {values.addressLine2 ? `, ${values.addressLine2}` : ""} —{" "}
            {values.town} ({values.postcode})
          </dd>
        </div>
        <div>
          <dt>Vivienda</dt>
          <dd>
            {values.livingSituation || "—"} · {values.householdSetting || "—"}
          </dd>
        </div>
        <div>
          <dt>Jardín</dt>
          <dd>{values.hasGarden === "si" ? "Sí" : "No"}</dd>
        </div>
        <div>
          <dt>Nivel de actividad</dt>
          <dd>{values.activityLevel || "—"}</dd>
        </div>
        <div>
          <dt>Adultos / Niños</dt>
          <dd>
            {values.adults} / {values.children}
          </dd>
        </div>
        <div>
          <dt>Otras mascotas</dt>
          <dd>{values.otherAnimals === "si" ? "Sí" : "No"}</dd>
        </div>
      </dl>
    </>
  );
};

export default StepConfirm;
