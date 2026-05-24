import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/errors";
import {
  registerSchema,
  type RegisterFormValues,
} from "../lib/validators/auth";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      style={{
        margin: "6px 0 0",
        color: "#dc3545",
        fontSize: 12,
        lineHeight: 1.4,
      }}
      role="alert"
    >
      {message}
    </p>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, sessionError, clearSessionError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    clearSessionError();
  }, [clearSessionError]);

  const onSubmit = async (values: RegisterFormValues) => {
    clearSessionError();

    try {
      const { confirmPassword, ...payload } = values;
      await signUp(payload);
      navigate("/feed", { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to create your account.",
      );
      setError("root", { type: "server", message });
    }
  };

  const rootMessage = errors.root?.message?.toString() || sessionError;

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img
          src="/assets/images/dark_shape.svg"
          alt=""
          className="_dark_shape"
        />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img
          src="/assets/images/dark_shape1.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img
          src="/assets/images/dark_shape2.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>

      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img
                    src="/assets/images/registration.png"
                    alt="Registration illustration"
                  />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img
                    src="/assets/images/registration1.png"
                    alt="Registration illustration dark"
                  />
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img
                    src="/assets/images/logo.svg"
                    alt="Buddy Script"
                    className="_right_logo"
                  />
                </div>

                <p className="_social_registration_content_para _mar_b8">
                  Get Started Now
                </p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">
                  Registration
                </h4>

                <button
                  type="button"
                  className="_social_registration_content_btn _mar_b40"
                  disabled
                >
                  <img
                    src="/assets/images/google.svg"
                    alt=""
                    className="_google_img"
                  />{" "}
                  <span>Register with google</span>
                </button>

                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                {rootMessage ? (
                  <div
                    role="alert"
                    style={{
                      marginBottom: 16,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(220,53,69,0.08)",
                      color: "#dc3545",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {rootMessage}
                  </div>
                ) : null}

                <form
                  className="_social_registration_form"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="register-first-name"
                        >
                          First name
                        </label>
                        <input
                          id="register-first-name"
                          type="text"
                          autoComplete="given-name"
                          className="form-control _social_registration_input"
                          aria-invalid={Boolean(errors.firstName)}
                          {...register("firstName")}
                        />
                        <FieldError message={errors.firstName?.message} />
                      </div>
                    </div>

                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="register-last-name"
                        >
                          Last name
                        </label>
                        <input
                          id="register-last-name"
                          type="text"
                          autoComplete="family-name"
                          className="form-control _social_registration_input"
                          aria-invalid={Boolean(errors.lastName)}
                          {...register("lastName")}
                        />
                        <FieldError message={errors.lastName?.message} />
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="register-email"
                        >
                          Email
                        </label>
                        <input
                          id="register-email"
                          type="email"
                          autoComplete="email"
                          className="form-control _social_registration_input"
                          aria-invalid={Boolean(errors.email)}
                          {...register("email")}
                        />
                        <FieldError message={errors.email?.message} />
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="register-password"
                        >
                          Password
                        </label>
                        <input
                          id="register-password"
                          type="password"
                          autoComplete="new-password"
                          className="form-control _social_registration_input"
                          aria-invalid={Boolean(errors.password)}
                          {...register("password")}
                        />
                        <FieldError message={errors.password?.message} />
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="register-confirm-password"
                        >
                          Repeat Password
                        </label>
                        <input
                          id="register-confirm-password"
                          type="password"
                          autoComplete="new-password"
                          className="form-control _social_registration_input"
                          aria-invalid={Boolean(errors.confirmPassword)}
                          {...register("confirmPassword")}
                        />
                        <FieldError message={errors.confirmPassword?.message} />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="radio"
                          name="flexRadioDefault"
                          id="flexRadioDefault2"
                          checked
                          readOnly
                        />
                        <label
                          className="form-check-label _social_registration_form_check_label"
                          htmlFor="flexRadioDefault2"
                        >
                          I agree to terms &amp; conditions
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          disabled={isSubmitting}
                          aria-busy={isSubmitting}
                        >
                          {isSubmitting
                            ? "Creating account..."
                            : "Register now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account?{" "}
                        <Link to="/login">Login here</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
