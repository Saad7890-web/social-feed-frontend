import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/errors";
import { loginSchema, type LoginFormValues } from "../lib/validators/auth";

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

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, sessionError, clearSessionError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    clearSessionError();
  }, [clearSessionError]);

  const onSubmit = async (values: LoginFormValues) => {
    clearSessionError();

    try {
      await signIn(values);
      navigate("/feed", { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to sign in.");
      setError("root", { type: "server", message });
    }
  };

  const rootMessage = errors.root?.message?.toString() || sessionError;

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
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

      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <img
                    src="/assets/images/login.png"
                    alt="Login illustration"
                    className="_left_img"
                  />
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <img
                    src="/assets/images/logo.svg"
                    alt="Buddy Script"
                    className="_left_logo"
                  />
                </div>

                <p className="_social_login_content_para _mar_b8">
                  Welcome back
                </p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">
                  Login to your account
                </h4>

                <button
                  type="button"
                  className="_social_login_content_btn _mar_b40"
                  disabled
                >
                  <img
                    src="/assets/images/google.svg"
                    alt=""
                    className="_google_img"
                  />{" "}
                  <span>Or sign-in with google</span>
                </button>

                <div className="_social_login_content_bottom_txt _mar_b40">
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
                  className="_social_login_form"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label
                          className="_social_login_label _mar_b8"
                          htmlFor="login-email"
                        >
                          Email
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          autoComplete="email"
                          className="form-control _social_login_input"
                          aria-invalid={Boolean(errors.email)}
                          {...register("email")}
                        />
                        <FieldError message={errors.email?.message} />
                      </div>
                    </div>

                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label
                          className="_social_login_label _mar_b8"
                          htmlFor="login-password"
                        >
                          Password
                        </label>
                        <input
                          id="login-password"
                          type="password"
                          autoComplete="current-password"
                          className="form-control _social_login_input"
                          aria-invalid={Boolean(errors.password)}
                          {...register("password")}
                        />
                        <FieldError message={errors.password?.message} />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="form-check _social_login_form_check">
                        <input
                          className="form-check-input _social_login_form_check_input"
                          type="radio"
                          name="flexRadioDefault"
                          id="flexRadioDefault2"
                          checked
                          readOnly
                        />
                        <label
                          className="form-check-label _social_login_form_check_label"
                          htmlFor="flexRadioDefault2"
                        >
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="_social_login_form_left">
                        <p className="_social_login_form_left_para">
                          Forgot password?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_login_form_btn_link _btn1"
                          disabled={isSubmitting}
                          aria-busy={isSubmitting}
                        >
                          {isSubmitting ? "Logging in..." : "Login now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Dont have an account?{" "}
                        <Link to="/register">Create New Account</Link>
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
