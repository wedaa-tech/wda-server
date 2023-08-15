const utility = require('../utility/core');
const refArchitectureDao = require('../dao/refArchitectureDao');
 
 /**
  * save refArchitecture to the db
  * @param {*} req 
  * @param {*} res 
  */
exports.saveRefArch = function (req,res) {
    const userId = req.kauth.grant.access_token.content.sub;
    const refArchitecture = req.body;
    refArchitecture.refArch_id = utility.createUniqueId(refArchitecture.name);
    refArchitecture.user_id = userId;
    refArchitectureDao.create(refArchitecture)
    .then(savedArchitecture => {
        console.log("Architecture was added successfully!");
        return res.status(200).send({message: "Architecture was added successfully!"});
    })
    .catch(error => {
        console.error(error);
        return res.status(500).send({ message: "Error saving architecture" });
    });
  }
  
  
  /**
   * Get specific architecture with given Id
   * @param {*} req 
   * @param {*} res 
   */
  exports.getRefArchById = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    refArchitectureDao.get({refArch_id: req.params.refArch_id})
    .then(result => {
      if (Array.isArray(result) && result.length === 1) {
          var uniqueResult = result[0];
          console.log("Retrieved architecture with architecture Id: "+ uniqueResult.refArch_id ); 
          return res.status(200).send(uniqueResult);
        } else {
          console.log("Retrieved architecture with project Id: "+ result.refArch_id); 
          return res.status(200).send({result});
        }
    })
    .catch(error => {
      console.error("Error retrieving architecture:", error);
      return res.status(500).send({ message: "Error retrieving architecture" });
    });
  };
  
  /**
   * Get all ref architectures
   * @param {*} req 
   * @param {*} res 
   */
  exports.get = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    refArchitectureDao.get({})
    .then(result => {
      if (Array.isArray(result) && result.length === 1) {
          var uniqueResult = result[0];
          console.log("Retrieved architecture with architecture Id: "+ uniqueResult.refArch_id ); 
          return res.status(200).send(uniqueResult);
        } else {
          console.log("Retrieved architecture with project Id: "+ result.refArch_id); 
          return res.status(200).send({result});
        }
    })
    .catch(error => {
      console.error("Error retrieving architecture:", error);
      return res.status(500).send({ message: "Error retrieving architecture" });
    });
  };

 /**
  * Update specific Architecture with given Id
  * @param {*} req 
  * @param {*} res 
  */
exports.updateRefArchs = function (req, res) {
    const userId = req.kauth.grant.access_token.content.sub;
    const updatedData = req.body; 
  
    refArchitectureDao.update({ refArch_id: req.params.refArch_id }, updatedData)
    .then(result => {
      if(result == null)
      {
        console.log("No Data present with the given Id:"+req.params.refArch_id)
        return res.status(500).send({ message:"No Data present with the given Id:"+req.params.refArch_id})
      }
      else if (Array.isArray(result) && result.length === 1) {
        var uniqueResult = result[0];
        console.log("Updated blueprint with project Id: " + uniqueResult.refArch_id + ", for the user: " + userId);
        return res.status(200).send(uniqueResult);
      } else {
        console.log("Updated blueprint with project Id: " + result.refArch_id + ", for the user: " + userId);
        return res.status(200).send({ result });
      }
    })
    .catch(error => {
      console.error("Error updating blueprint:", error);
      return res.status(500).send({ message: "Error updating blueprint" });
    });
  };


 /**
  * Delete the blueprint with given project Id
  * @param {*} req 
  * @param {*} res 
  */
  exports.delete= function (req, res) {
    refArchitectureDao.get({refArch_id: req.params.refArch_id})
    .then(result => {
      if (Array.isArray(result) && result.length === 1) {
        refArchitectureDao.delete({ refArch_id: req.params.refArch_id })
          .then(result => {
            return res.status(200).send({ message: "Reference Architecture deleted successfully" });
          })
          .catch(error => {
            console.error("Error while deleting Reference Architecture:", error);
            return res.status(500).send({ message: "Error while deleting Reference Architecture" });
          });
      } else {
        console.log("No Reference Architecture is present with Id: "+ req.params.refArch_id); 
        return res.status(204);
      }
    })
    .catch(error => {
      console.error("Error retrieving Reference Architecture:", error);
      return res.status(500).send({ message: "Error retrieving Reference Architecture" });
    });
  };