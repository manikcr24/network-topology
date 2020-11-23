const router = require('express').Router()
const bodyParser = require('body-parser')
const Graph = require("graph-data-structure");
const Graphology = require('graphology')

const allSimplePaths = require('graphology-simple-path').allSimplePaths




var grapho = new Graphology()
var graph = Graph();

const deviceTypes = new Map()
const deviceStrengths = new Map()


router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res) => {
    console.log('get request on /');
    res.json({ response: 'connection succeeded' })
})




/** 
 * Add a new device to network 
 * content-type : application/json
 * {"type" : "COMPUTER", "name" : "A1"}
 */
router.post('/devices', (req, res) => {
    console.log('INFO : creating a device')
    let newNode = req.body.name
    graph.addNode(newNode);

    grapho.addNode(newNode)

    if (req.body.type == 'COMPUTER') {
        deviceStrengths.set(req.body.name, 5)
    }
    deviceTypes.set(req.body.name, req.body.type)
    res.json({ currentState: graph.serialize() })
})


/** 
 * create connections between devices 
 * input format is {source: 'src_end', targets: [target1, target2...]}
 */
router.post('/connections', (req, res) => {
    console.log('INFO : creating connections between devices')
    console.log(req.body)
    let source = req.body.source
    var sourceType = deviceTypes.get(source)

    let targets = req.body.targets
    for (let ind in targets) {
        target = targets[ind]
        let targetType = deviceTypes.get(target)
        graph.addEdge(source, target)
        graph.addEdge(target, source)

        grapho.addEdge(source, target);
        grapho.addEdge(target, source);
    }


    res.json({ currentState: graph.serialize() })
})


/** 
 * List all devices in the network
 * content-type : application/json
 */
router.get('/devices', (req, res) => {
    console.log(req.body)
    res.json({ deviceTypes })
})

/** 
 * FETCH /info-routes?from=A1&to=A2
 * content-type : application/json
 */
router.get('/info-route', (req, res) => {
    let source = req.query.from
    let target = req.query.to

    console.log(req.query)

    console.log('INFO : Fetching route info from ' + source + ' to ' + target)
    let shortestPath = graph.shortestPath(source, target)
    console.log(shortestPath)
    const paths = []
    try{
        paths = allSimplePaths(grapho, source, target);
    } catch(err) {
        return res.json({error: `No path exists between ${source} and ${target}`})
    }
    

    const possiblePath = "NOT_POSSIBLE";

    // check if we can travel from src to target in any path with the given strengths
    for (let ind in paths) {
        let path = paths[ind]

        if(isPossible(path)) {
            possiblePath = path;
            break;
        } else{
            continue;
        }
    }

    res.json({ shortestPath, paths, possiblePath })
})


function isPossible(path) {
    let source = path[0]
    let signalStrength = deviceStrengths.get(source)

    for (var i = 1; i < path.length; i++) {
        signalStrength -= 1;
        if (signalStrength < 0) return false;
        if(deviceTypes.get(path[i]) == 'ROUTER') {
            signalStrength *= 2;
        }        
    }

    if(signalStrength > -1) return true;
    return false;
}


/** 
 * MODIFY /devices/A1/strength 
 * CHANGE DEVICE STRENGTH
 * content-type : application/json
 * {"value": 2}
 */
router.post('/devices/:deviceId/strength', (req, res) => {
    let deviceId = req.params.deviceId
    let strength = req.body.value
    console.log('INFO : Setting device strength')
    console.log(req.params)
    deviceStrengths.set(deviceId, Number(value))
    res.json({ deviceStrengths })
})




module.exports = router