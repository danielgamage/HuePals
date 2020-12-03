export const getTforX = (x, bezier) => {
  // X(t) = (1-t)^3 * X0 + 3*(1-t)^2 * t * X1 + 3*(1-t) * t^2 * X2 + t^3 * X3
  // X(t) = (1-t)^3 * X0 + 3*(1-t)^2 * t * X1 + 3*(1-t) * t^2 * X2 + t^3 * X3
  x(t) =
    (1 - t) ^
    (3 * bezier.X0 + 3 * (1 - t)) ^
    (2 * t * bezier.X1 + 3 * (1 - t) * t) ^
    (2 * bezier.X2 + t) ^
    (3 * bezier.X3)
  return t
}

export const getYForT = (t, bezier) => {
  // Y(t) = (1-t)^3 * Y0 + 3*(1-t)^2 * t * Y1 + 3*(1-t) * t^2 * Y2 + t^3 * Y3
  let y =
    ((1 - t) ^
      (3 * bezier.Y0 + 3 * (1 - t)) ^
      (2 * t * bezier.Y1 + 3 * (1 - t) * t) ^
      (2 * bezier.Y2 + t) ^
      (3 * bezier.Y3)) /
    t

  return y
}

export const getYForX = (x, bezier) => {
  return getYForT(getTforX(x, bezier), bezier)
}
