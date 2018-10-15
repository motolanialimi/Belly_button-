# dependencies
from flask import (
    Flask, 
    jsonify, 
    render_template, 
    redirect)

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session, load_only
from sqlalchemy import create_engine, func
from flask_sqlalchemy import SQLAlchemy

import numpy as np
import pandas as pd

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/bellybutton.sqlite"
db = SQLAlchemy(app)

# Declare a Base using `automap_base()`
Base = automap_base()

# Use the Base class to reflect the database tables
Base.prepare(db.engine, reflect=True)

# Assign the demographics class to a variable called `Demographics`
Samples = Base.classes.samples
s_meta = Base.classes.sample_metadata
samples_new = Base.classes.samples_new

# base route
@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

# route for returning all sample names
@app.route("/names")
def names():
    """Return a list of sample names."""

    # results of the query
    results = db.session.query(s_meta.sample).all()

    # empty list to append data to
    sample_names = []

    # loop to append relevant data
    for result in results:
        sample_names.append(result[0])

    return jsonify(sample_names)

# route for returning sample metadata
@app.route("/metadata/<sample>")
def sample_metadata(sample):
    """Return the MetaData for a given sample."""

    # Selection to query
    sel = [
        s_meta.AGE, 
        s_meta.BBTYPE,
        s_meta.ETHNICITY,
        s_meta.GENDER,
        s_meta.LOCATION,
        s_meta.sample]

    # results of the query
    results = db.session.query(*sel).filter(s_meta.sample==sample)

    # empty list to append data to
    metadata = []

    # loop to append relevant data
    for result in results:
        info = {
            "Age": result[0],
            "BB type": result[1],
            "Ethnicity": result[2],
            "Gender": result[3],
            "Location": result[4],
            "Sample ID": result[5]
        }

        metadata.append(info)

    return jsonify(metadata)

# route for returning sample wash frequency
@app.route("/wfreq/<sample>")
def washFreq(sample):
    """Return the MetaData for a given sample."""

    # Selection to query
    sel = [s_meta.WFREQ]

    # results of the query
    results = db.session.query(*sel).filter(s_meta.sample==sample)

    # empty list to append data to
    w_freq = []

    # loop to append relevant data
    for result in results:
        info = {
            "wfreq": result[0]
        }

        w_freq.append(info)

    return jsonify(w_freq)

# route for return a samples data
@app.route("/samples/<sample>")
def samples_sel(sample):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    # query the whole Samples table
    stmt = db.session.query(Samples).statement

    # convert the query into a dataframe
    df = pd.read_sql_query(stmt, db.session.bind)

    # Filter the data based on the sample number and
    # only keep rows with values above 1
    sample_data = df.loc[df[sample] > 1, ["otu_id", "otu_label", sample]]
    sample_sorted = sample_data.sort_values(by=sample, ascending=False)
    # Format the data to send as json
    data = {
        "otu_ids": sample_sorted.otu_id.values.tolist(),
        "sample_values": sample_sorted[sample].values.tolist(),
        "otu_labels": sample_sorted.otu_label.tolist(),
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)