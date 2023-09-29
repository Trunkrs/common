const getAWS = () => {
  if (process.env.IS_LOCAL && process.env.IS_LOCAL.toLowerCase() === 'true') {
    return AWS
  }

  return XRay.captureAWS(AWS)
}

export default getAWS
