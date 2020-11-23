const Devices = require('./constants').Devices
const ErrorMessages = require('./errors')

const validateAdddingDevice = (req, res, next) => {
    if(!req.body.name || !req.body.type ) return res.sendStatus(400)

    if(! (req.body.type == Devices.COMPUTER || req.body.type == Devices.REPEATER) ) {
        return res.json({error: ErrorMessages.NOT_A_DEVICE}).sendStatus(400)
    }
    next()
}

const validateConnectingDevices = (req, res, next) => {
    if(!req.body.source || !req.body.targets ) return res.sendStatus(400)

    if(!req.body.targets.length || req.body.targets.length < 1) return res.sendStatus(400)

    next();
}


module.exports = {
    validateAdddingDevice,
    validateConnectingDevices,
}