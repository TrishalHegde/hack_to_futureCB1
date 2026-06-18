from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class ClaimRecord(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=True)
    verdict = Column(String, index=True)
    confidence = Column(Float)
    risk_score = Column(Float)
    category = Column(String, index=True) # Politics, Health, etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    evidences = relationship("EvidenceRecord", back_populates="claim")

class EvidenceRecord(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"))
    url = Column(String)
    title = Column(String)
    snippet = Column(Text)

    claim = relationship("ClaimRecord", back_populates="evidences")
