const refArchitectureDao = require('../dao/refArchitectureDao');
 
 /**
  * save refArchitecture to the db
  * @param {*} req 
  * @param {*} res 
  */
exports.saveRefArch = function (req,res) {
    const userId = req.kauth.grant.access_token.content.sub;
    const refArchitecture = req.body;
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
    refArchitectureDao.get({_id: req.params.id})
    .then(result => {
      if (Array.isArray(result) && result.length === 1) {
          var uniqueResult = result[0];
          console.log("Retrieved architecture with architecture Id: "+ uniqueResult._id ); 
          return res.status(200).send(uniqueResult);
        } else {
          console.log("Retrieved architecture with project Id: "+ result._id); 
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
          console.log("Retrieved architecture with architecture Id: "+ uniqueResult._id ); 
          return res.status(200).send(uniqueResult);
        } else {
          console.log("Retrieved architecture with project Id: "+ result._id); 
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
  
    refArchitectureDao.update({ _id: req.params.id }, updatedData)
    .then(result => {
      if(result == null)
      {
        console.log("No Data present with the given Id:"+req.params.id)
        return res.status(500).send({ message:"No Data present with the given Id:"+req.params.id})
      }
      else if (Array.isArray(result) && result.length === 1) {
        var uniqueResult = result[0];
        console.log("Updated architecture with Id: " + uniqueResult._id + ", for the user: " + userId);
        return res.status(200).send(uniqueResult);
      } else {
        console.log("Updated architecture with Id: " + result._id + ", for the user: " + userId);
        return res.status(200).send({ result });
      }
    })
    .catch(error => {
      console.error("Error updating architecture:", error);
      return res.status(500).send({ message: "Error updating architecture" });
    });
  };


 /**
  * Delete the Specific Architecture with given Id
  * @param {*} req 
  * @param {*} res 
  */
  exports.delete= function (req, res) {
    refArchitectureDao.get({_id: req.params.id})
    .then(result => {
      if (Array.isArray(result) && result.length === 1) {
        refArchitectureDao.delete({ _id: req.params.id })
          .then(result => {
            return res.status(200).send({ message: "Reference Architecture deleted successfully" });
          })
          .catch(error => {
            console.error("Error while deleting Reference Architecture:", error);
            return res.status(500).send({ message: "Error while deleting Reference Architecture" });
          });
      } else {
        console.log("No Reference Architecture is present with Id: "+ req.params.id); 
        return res.status(204);
      }
    })
    .catch(error => {
      console.error("Error retrieving Reference Architecture:", error);
      return res.status(500).send({ message: "Error retrieving Reference Architecture" });
    });
  };
