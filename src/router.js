const router = require('express').Router()
const bodyParser = require('body-parser')
const Graph = require("graph-data-structure");
const Graphology = require('graphology')
const allSimplePaths = require('graphology-simple-path').allSimplePaths

const Devices = require('./constants').Devices
const ErrorMessages = require('./errors')

/** create graph data structure **/
var grapho = new Graphology()
var graph = Graph();

const middleware = require('./middleware')

/** temp maps for storing node data */
const deviceTypes = new Map()
const deviceStrengths = new Map()

/** middleware */
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))


/** rest api documentation page */
router.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))


/** Add a new device to network */
router.post('/devices', middleware.validateAdddingDevice, (req, res) => {
    let newNode = req.body.name

    graph.addNode(newNode)
    grapho.addNode(newNode)

    if (req.body.type == Devices.COMPUTER) {
        deviceStrengths.set(req.body.name, 5)
    }
    deviceTypes.set(newNode, req.body.type)
    res.json({ currentState: graph.serialize() })
})


/** create connections between devices  */
router.post('/connections', middleware.validateConnectingDevices, (req, res) => {
    let source = req.body.source
    let targets = req.body.targets

    for (let ind in targets) {
        target = targets[ind]
        createConnection(source, target)
    }

    res.json({ currentState: graph.serialize() })
})

function createConnection(source, target) {
    grapho.addEdge(source, target)
    grapho.addEdge(target, source)

    graph.addEdge(source, target)
    graph.addEdge(target, source)    
}

/** List all devices in the network */
router.get('/devices', (req, res) => {
    devices = {}
    for (const [key, value] of deviceTypes.entries()) {
        devices[key] = value;
    }
    return res.json({ devices })
})

/** FETCH /info-routes?from=A1&to=A2 */
router.get('/info-route', (req, res) => {
    let source = req.query.from
    let target = req.query.to

    // let shortestPath = graph.shortestPath(source, target)

    const paths = allSimplePaths(grapho, source, target);

    if(!paths || paths.length == 0) 
        return res.json({ err_message: ErrorMessages.NO_PATH_EXISTS })



    var possiblePath = "NOT_POSSIBLE";

    // check if we can travel from src to target in any path with the given strengths
    for (let ind in paths) {
        let path = paths[ind]

        if (isPossible(path)) {
            possiblePath = path;
            break;
        } else {
            continue;
        }
    }

    res.json({ possiblePath })
})


function isPossible(path) {
    let source = path[0]
    let signalStrength = deviceStrengths.get(source)

    for (var i = 1; i < path.length; i++) {
        signalStrength -= 1;
        if (signalStrength < 0) return false;
        if (deviceTypes.get(path[i]) == Devices.REPEATER) {
            signalStrength *= 2;
        }
    }

    if (signalStrength > -1) return true;
    return false;
}


/** MODIFY /devices/A1/strength */
router.post('/devices/:deviceId/strength', (req, res) => {
    let deviceId = req.params.deviceId
    if(!isValidDeviceId(deviceId)) return res.json({error: ErrorMessages.DEVICE_DOES_NOT_EXIST})

    let strength = req.body.value
    if(!Number(strength)) return res.json({error: ErrorMessages.STRENGTH_SHOULD_BE_A_NUMBER})

    deviceStrengths.set(deviceId, Number(strength))
    res.json({ deviceStrengths })
})


module.exports = router